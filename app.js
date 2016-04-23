var express = require('express');
var session = require('express-session'); //Pour créer/gérer des sessions
var mysql = require('mysql');
var config = require('./config.json'); //Fichier de configuration
var bdd_plv = require('./node_modules/BDD_PLV/bdd_plv.js'); //Gestion de la base de données
var multer = require('multer');//Gestionnaire pour récuperer les données des formulaires en multipart/form-data.
var sessionStore = new session.MemoryStore(); //Les sessions seront stockés dans la RAM du serveur
var app = new express(); //Application contenant tous les middlewares
var connexionBDD = mysql.createConnection({
    host: config.databaseConnexion.host,
    port: config.databaseConnexion.port,
    localAddress: config.databaseConnexion.localAddress,
    user: config.databaseConnexion.user,
    password: config.databaseConnexion.password,
    database: config.databaseConnexion.database,
    dateStrings: config.databaseConnexion.dateStrings
});

var extensionsAvailable = ['jpg', 'jpeg', 'jif', 'jfif', 'png', 'gif'];
var mimeTypesAvailable = ['image/gif', 'image/jpeg', 'image/png'];
var dateRegexPattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
var portEcoute = 5858; //Le serveur ecoute sur ce port
var codeSecretInscription = config.inscriptionConfig.secretCode;

connexionBDD.connect(function (err) {
    //Connexion avec la base de données, en cas d'erreur
    //verifier si la base de données est bien accessible
    if (err) {
        console.error('error connecting: ' + err.stack);
        return;
    }

    console.log('Connexion avec la base de données réussie. id = ' + connexionBDD.threadId);
});


app.use(session({
    secret: 'secrettoken-dsfds26t9u7i1m2cs6e7',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {maxAge: config.cookie.maxAge} //Durée du cookie de session : 1 semaine
}));

app.use(express.static(__dirname + '/public')); //Dossier des fichiers static : CSS/JS/IMG pour les pages ejs/html
app.use(multer({
    dest: __dirname + "/public/UserPictures/",
    rename: function (fieldname, filename) {
        return filename.replace(/\W+/g, '-').toLowerCase() + Date.now()
    },
    limits: {
        fieldNameSize: 100, //Le nom du champ a une taille max de 100 o = 100 charactères ASCII
        fieldSize: config.formConfig.maxFieldSize, //Taille max d'un champ
        fileSize: config.formConfig.maxFileSize, //La taille limite d'un fichier en octets
        files: 1 //Un formulaire renvoi au maximum 1 fichier
    },
    onFileUploadStart: function (file) {
        if (extensionsAvailable.indexOf(file.extension) == -1 || mimeTypesAvailable.indexOf(file.mimetype) == -1) {
            //Ce fichier ne peut être accepté puisqu'il est d'une extension non-acceptée. Voir tableau extensionsAvailable
            console.log("Fichier de mauvaise extension : " + file.extension);
            return false;
        }
    },
    onFileSizeLimit: function (file) {
        //Ce fichier est de taille trop grande. Voir le champ "fileSize" dans "limits".
        console.log('Fichier trop lourd : ', file.originalname + " " + file.size + " o/" + config["formConfig"].maxFileSize + " o");
        return false;
    }
}));

app.engine('html', require('ejs').renderFile); //Nous utilisons ejs comme moteur de template
app.set('view engine', 'html');

var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

app.get('/', function (req, res) {
    // Si l'utilisateur est connecté et essaye d'accéder à la racine du site
    // redirection sur la page diaporam sinon sur la page connexion
    if (req.session.login) {
        res.redirect('./diaporama');
    }
    else {
        res.redirect('./connexion');
    }
});


app.get('/connexion', function (req, res) {
    if (req.session.login) {
        //L'utilisateur souhaite acceder à la page de connexion mais il est déjà connecté
        //redirection vers page diaporama avec un message d'information
        req.session.informationMessage = "Vous êtes déjà connecté.";
        res.redirect('./diaporama');
    } else {
        var message = req.session.informationMessage;
        req.session.informationMessage = null;
        res.render('connexion.ejs', {
            informationMessage: message
        });
    }
});
app.get('/inscription', function (req, res) {
    if (req.session.login) {
        //L'utilisateur souhaite acceder à la page d'inscription mais il est déjà connecté
        //redirection vers page diaporama avec un message d'information
        req.session.informationMessage = "Vous devez vous deconnecter avant de pouvoir réaliser une inscription.";
        res.redirect('./diaporama');
    } else {
        var message = req.session.informationMessage;
        req.session.informationMessage = null;
        //L'utilisateur n'est pas connecté
        res.render('inscription.ejs', {
            informationMessage: message
        });
    }
});
app.get('/newSlide', function (req, res) {
    if (req.session.login) { //L'utilisateur est bien connecé, il a le droit de créer un slide
        var message = req.session.informationMessage;
        req.session.informationMessage = null;
        res.render('newSlide.ejs', {informationMessage: message, login: req.session.login});
    } else { //L'utilisateur n'est pas connecté, redirecion vers cette page de connexion
        req.session.informationMessage = "Vous devez vous connecter pour pouvoir créer un slide.";
        res.redirect('./connexion');
    }
});
app.get('/deleteSlide/:id', function (req, res) {
    //L'utilisateur souhaite supprimer le slide d'id donné
    //S'il est connecté, on supprime bien le slide
    //Sinon on lui envoi un message d'information
    if (req.session.login) {
        //En réalité, le slide n'est pas supprimé de la BDD mais
        //le champ 'supprime' passe à 'true' ce qui
        //l'empêche d'être selectionné pour l'afficher
        bdd_plv.deleteSlide(connexionBDD, req.params.id, function () {
            //On avertit tous les clients de supprimer le slide,
            //si un client le possède il fera la suppression
            io.sockets.emit('deleteSlide', {id: req.params.id});
        });
        req.session.lastSlideDeleted = req.params.id;
        res.redirect('/diaporama');
    }
    else {
        //L'utilisateur n'est pas connecté et n'a donc pas le droit de supprimer un slide
        req.session.informationMessage =
            "Vous devez être connecté pour pouvoir supprimer un slide.";
        res.redirect('/connexion');
    }
});
app.get('/recoverSlide/:id', function (req, res) {
    //L'utilisateur souhaite annuler la suppression d'un slide d'id doné
    //Connecté ou pas, cette action semble légitime
    bdd_plv.recoverSlide(connexionBDD, req.params.id, function (data) {
        //Il faut avértir tous les clients d'ajouter ce slide
        io.sockets.emit('newSlideInserted', {
            id: data.id,
            titre: data.titre,
            type: data.type,
            startDate: data.date_debut,
            startTime: data.time_debut,
            endDate: data.date_fin,
            endTime: data.time_fin,
            slideImportance: data.importance,
            audience: data.audience,
            texte: data.texte,
            image_url: data.image_url,
            video_url: data.video_url
        });
    });
    req.session.lastSlideDeleted = null;
    res.redirect('/diaporama');
});
app.get('/diaporama', function (req, res) {
    var message;
    var lastSlideDeleted;
    if (req.session.login) {
        console.log("Page diaporama visitee par : " + req.session.login);
    }
    else {
        req.session.login = null;
    }
    if (req.session.lastSlideDeleted) {
        lastSlideDeleted = req.session.lastSlideDeleted;
        req.session.lastSlideDeleted = null;
    }

    message = req.session.informationMessage;
    req.session.informationMessage = null; //Pour faire en sorte que le message ne s'affiche qu'une fois
    res.render('diaporama.ejs', {
        informationMessage: message,
        lastSlideDeleted: lastSlideDeleted,
        login: req.session.login
    });
});

app.get('/logout', function (req, res) {//L'utilisateur souhaite se deconnecter
    if (req.session.login) {
        console.log("Deconnexion : " + req.session.login);
    }

    req.session.destroy(function (err) {
        if (err) {
            console.log(err);
        } else {
            res.redirect('/connexion');
        }
    });
});


app.post('/connexion', function (req, res) {
    var login = req.body.login;
    var password = req.body.password;

    var connexionUserSucceed = function (idUser) {
        req.session.idUser = idUser;
        req.session.login = login;
        req.session.informationMessage = null;
        console.log("Connexion :" + login);
        res.redirect('./diaporama');
    };

    var connexionUserFailed = function () {
        req.session.informationMessage = "Login ou mot de passe incorrect.";
        res.redirect('./connexion');
    };

    bdd_plv.testConnexion(connexionBDD, login, password, connexionUserSucceed, connexionUserFailed);
});

app.post('/inscription', function (req, res) {

    var login = req.body.login;
    var password = req.body.password;
    var password_verification = req.body.password_verification;
    var secretCodeUser = req.body.secret_code;

    if (secretCodeUser != codeSecretInscription) {
        req.session.informationMessage = "Le code secret d'inscription est incorrect. Contactez l'administrateur pour l'obtenir.";
        res.redirect('./inscription');
    }
    else if (password != password_verification) {
        req.session.informationMessage = "Les deux mot de passe sont différents.";
        res.redirect('./inscription');
    }
    else {
        var userIsNew = function () {
            //Cas nouveau login
            bdd_plv.inscription(connexionBDD, login, password, function () {
                //Cas inscription reussie
                req.session.informationMessage = null;
                res.redirect('./connexion');
            });
        };

        var userNotNew = function () {
            //Cas login déjà utilisé
            req.session.informationMessage = "Ce login est déjà utilisé.";
            res.redirect('/inscription');
        };

        bdd_plv.estNouveau(connexionBDD, login, userIsNew, userNotNew);
    }
});

app.post('/newSlide', function (req, res) { //INSERTION D'UN NOUVEAU SLIDE

    var slideTitle = req.body.slideTitle;
    var slideType = req.body.slideType;
    var startDate = req.body.startDate;
    var useStartDate = req.body.useStartDate;
    var useEndDate = req.body.useEndDate;
    console.log(useEndDate + " " + useEndDate);
    var endDate = req.body.endDate;
    var slideImportance = req.body.slideImportance;
    var slideAudience = req.body.slideAudience;
    var slideText = (slideType == 'textimage' || slideType == 'text') ? req.body.slideText : "";
    var slideImage = (slideType == 'textimage' || slideType == 'image') ? ((req.files.slideImage) ? req.files.slideImage.name : "null") : "null";
    var slideVideo = (slideType == 'video') ? ((req.files.slideVideo) ? req.files.slideVideo.name : "null") : "null";

    if ((slideType == 'textimage' || slideType == 'image') && slideImage == "null") {
        req.session.informationMessage = "Le slide n'a pas pu être créée. L'image n'en était pas une ou était trop lourde.";
    }
    if ((slideType == 'video') && slideVideo == "null") {
        req.session.informationMessage = "Le slide n'a pas pu être créée. La vidéo n'en était pas une ou était trop lourde.";
    }
    else {
        var slideInsertionSucceed = function (id) {
            if (id >= 0) {
                io.sockets.emit('newSlideInserted', {
                    id: id,
                    titre: slideTitle,
                    type: slideType,
                    startDate: startDate,
                    startTime: startTime,
                    endDate: endDate,
                    endTime: endTime,
                    slideImportance: slideImportance,
                    audience: slideAudience,
                    texte: slideText,
                    image_url: slideImage,
                    video_url: slideVideo
                });
            }
        };

        //Vérification du format de la date et verification que les autres champs ont bien une valeur
        if (dateRegexPattern.test(startDate) && dateRegexPattern.test(endDate) && slideTitle != undefined && slideType != undefined && slideImportance != undefined && slideAudience != undefined && slideText != undefined) {
            startDate = startDate.split("T");
            var startTime = startDate[1];
            startDate = startDate[0];
            endDate = endDate.split("T");
            var endTime = endDate[1];
            endDate = endDate[0];

            bdd_plv.insertSlide(connexionBDD, slideTitle, slideType, startDate, startTime, endDate, endTime, slideImportance, slideAudience, slideText, slideImage, slideVideo, req.session.idUser, slideInsertionSucceed);
            console.log(req.session.login + " a cree un nouveau slide.");
        }
        else {
            console.log(dateRegexPattern.test(startDate) + "  " + dateRegexPattern.test(endDate));

        }
    }
    res.redirect('./diaporama');
});
app.post('/createAudience', function (req, res) {

    var onSucceedCreation = function () {
        console.log("Creation d'une audience : " + req.body.intituleCreateAudience);
    };

    if (req.session.login) {
        bdd_plv.createAudience(connexionBDD, req.body.intituleCreateAudience, onSucceedCreation);
        res.redirect('/diaporama');
    }
    else {
        //L'user n'est pas connecté et n'a donc pas le droit de créer une audience
        req.session.informationMessage = "Vous devez être connecté pour pouvoir créer une audience.";
        res.redirect('/diaporama');
    }
});
app.post('/deleteAudience', function (req, res) {


    if (req.session.login) {
        //L'user a le droit de supprimer une audience
        var newAudience = req.body.intituleDeleteAudience;
        //Par définition, l'audience "Tout le monde ne peut pas être supprimée
        if (newAudience.lowercase == "tout le monde") {
            req.session.informationMessage = "Cette audience ne peut pas être supprimée.";
            res.redirect('/diaporama');
        }
        else {
            var ifAudienceExist = function (id) {
                //Fonction si l'audience existe bien
                bdd_plv.deleteAudience(connexionBDD, id, function () {
                    req.session.informationMessage = "L'audience a bien été supprimée.";
                    console.log("Suppression d'une audience : " + req.body.intituleDeleteAudience);
                }, function (str) {
                    req.session.informationMessage = str;
                });
                res.redirect('/diaporama');
            };

            var ifAudienceDoesntExist = function () {
                //Cas où l'audience n'existe pas
                req.session.informationMessage = "Vous ne pouvez pas supprimer une audience qui n'existe pas.";
                res.redirect('/diaporama');
            };

            bdd_plv.isAudienceExist(connexionBDD, newAudience, ifAudienceDoesntExist, ifAudienceExist)
        }
    }
    else {
        //L'user n'est pas connecté et n'a donc pas le droit de supprimer une audience
        req.session.informationMessage = "Vous devez être connecté pour pouvoir supprimer une audience.";
        res.redirect('/diaporama');
    }
});

app.use(function (req, res, next) {
    res.setHeader('Content-Type', 'text/plain');
    console.log('Tentative d\'acces : ' + req.url);
    res.status(404).send('Page Introuvable !');
});


io.sockets.on('connection', function (socket) { //Connexion du socket
    socket.on('getConfig', function () {
        socket.emit('reply_getConfig', {config: config.diaporamaConfig}); //On envoi que la configuration du diaporama
    });
    socket.on('getSlides', function (data) {
        bdd_plv.getSlides(connexionBDD, data["audience"], function (res) {
            socket.emit('reply_getSlides', res);
        });
    });

    socket.on('getAllAudiences', function () {
        bdd_plv.getAllAudiences(connexionBDD, function (res) {
            socket.emit('reply_getAllAudiences', res);
        });
    });

    socket.on('checkLoginExist', function (login) {
        var socketRes = function (doesExist) {
            socket.emit('reply_checkLoginExist', {exist: doesExist.toString()});
        };
        bdd_plv.estNouveau(connexionBDD, login, function () {
            socketRes(false);
        }, function () {
            socketRes(true);
        });
    });
    socket.on('isAudienceExist', function (data) {
        var socketRes = function (doesExist) {
            socket.emit('reply_isAudienceExist', {exist: doesExist.toString()});
        };
        bdd_plv.isAudienceExist(connexionBDD, data['intitule'], function () {
            socketRes(false);
        }, function () {
            socketRes(true);
        });
    });

});

function removeFromArray(array, elem) {
    //Supprimer un element d'un tableau
    var index = array.indexOf(elem);
    if (index > -1) {
        array.slice(index, 1);
    }
}

server.listen(portEcoute);
console.log("\n127.0.0.1:" + portEcoute);