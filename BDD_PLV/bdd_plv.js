exports.getSlides = function (connexionBDD, idAudience, callback) {
    if (idAudience == 0) {
        var req = "SELECT	`id`, `titre`, `type`, `date_debut`, `date_fin`, `time_debut`, `time_fin`, `importance`, `audience`, `texte`, `image_url`, `video_url`, `id_user`, `supprime`  FROM	`slide` WHERE 	(TO_DAYS(`date_debut`)*3600*24)+TIME_TO_SEC(`time_debut`)	<=	(TO_DAYS(NOW())*3600*24)+TIME_TO_SEC(NOW()) AND		(TO_DAYS(`date_fin`)  *3600*24)+TIME_TO_SEC(`time_fin`)		>	(TO_DAYS(NOW())*3600*24)+TIME_TO_SEC(NOW()) AND supprime='false'";
        connexionBDD.query(req, function (err, rows, fields) {
            if (err) throw err;
            else
                callback(rows);
        });
    }
    else {
        var req = "SELECT	`id`, `titre`, `type`, `date_debut`, `date_fin`, `time_debut`, `time_fin`, `importance`, `audience`, `texte`, `image_url`, `video_url`, `id_user`, `supprime`  FROM	`slide` WHERE 	(TO_DAYS(`date_debut`)*3600*24)+TIME_TO_SEC(`time_debut`)	<=	(TO_DAYS(NOW())*3600*24)+TIME_TO_SEC(NOW()) AND		(TO_DAYS(`date_fin`)  *3600*24)+TIME_TO_SEC(`time_fin`)		>	(TO_DAYS(NOW())*3600*24)+TIME_TO_SEC(NOW()) AND (audience=? OR audience=0) AND supprime='false'";
        connexionBDD.query(req, [idAudience], function (err, rows, fields) {
            if (err) throw err;
            else
                callback(rows);
        });
    }
}

exports.getAllAudiences = function (connexionBDD, callback) {
    connexionBDD.query('SELECT id, intitule FROM audience', function (err, rows, fields) {
        if (err) throw err;
        else
            callback(rows);
    });
}


/**
 *  Cette fonction ne supprime pas réellement un slide de la base de données.
 *  En réalité, le champ 'supprime' est changé en 'true'. De cette façon
 *  Le slide reste récupérable.
 */
exports.deleteSlide = function (connexionBDD, id, onSuccess) {
    var query = connexionBDD.query("UPDATE slide SET supprime='true' WHERE id=?", [id], function (err, results) {
        if (err) throw err;

        if (results.changedRows > 0) {
            onSuccess();
        }
    });
}


exports.recoverSlide = function (connexionBDD, id, onSuccess) {
    var query = connexionBDD.query("UPDATE slide SET supprime='false' WHERE id=?", [id], function (err, results) {
        if (err) throw err;
        if (results.changedRows > 0) {
            var query = connexionBDD.query("SELECT * FROM slide WHERE id=?", [id], function (err, rows, fields) {
                if (err) throw err;

                onSuccess(rows[0]);
            });
        }
    });
}

/*
 Verifier si le login donné est présent dans la base de données.
 S'il est déjà présent, callback de whenNew, sinon callback de whenNotNew.
 En cas d'erreur, callback de whenErr
 */
exports.estNouveau = function (connexionBDD, login, whenNew, whenNotNew, whenErr) {
    connexionBDD.query('SELECT id FROM user WHERE login = ?', [login], function (err, rows, fields) {
        if (err) {
            throw err;
            if (whenErr != undefined) whenErr();
        }
        else if (rows[0] === undefined) {//Nouveau utilisateur
            if (whenNew != undefined) whenNew();
        }
        else {//Utilisateur déjà inscrit/Login déjà prit
            if (whenNotNew != undefined) whenNotNew();
        }
    });
}

exports.deleteAudience = function (connexionBDD, id, onSucceed, onFail) {
    if (id > 0) {
        connexionBDD.query("DELETE FROM audience WHERE id=?", id, function (err, result) {
            ;
            if (result.affectedRows > 0)
                onSucceed();
            else
                onFail("Erreur interne à la base de données. Réessayez plus tard.");
        });
    }
    else {
        onFail("La suppression de cette audience n'est pas autorisée.");
    }
}
exports.deleteLastSlideInserted = function (connexionBDD) {
    var query = "DELETE FROM slide WHERE id=(SELECT id FROM (SELECT s.id FROM slide s ORDER BY s.id DESC LIMIT 1) as tmptable)";
    connexionBDD.query(query, function (err, result) {
        if (err) throw err;
        console.log(result.affectedRows + " line has been deleted from slide table");
    });
}
exports.isAudienceExist = function (connexionBDD, intitule, whenNotExist, whenExist) {
    connexionBDD.query('SELECT id FROM audience WHERE intitule=?', intitule, function (err, rows, fields) {
        if (err)
            throw err;
        if (rows.length == 0 && whenNotExist)
            whenNotExist();
        else if (rows != [] && whenExist)
            whenExist(rows[0]['id']);
    });
}


exports.testConnexion = function (connexionBDD, login, password, onSucceed, onFail) {
    var query = connexionBDD.query("SELECT id FROM user WHERE login=? AND password=?", [login, password], function (err, rows, fields) {
        if (err || rows == "") {
            onFail();
        }
        else {
            onSucceed(rows[0]['id']);
        }
    });
}


/**
 Inscription d'un utilisateur. En cas de réussite, callback de onSucceed
 */
exports.inscription = function (connexionBDD, login, password, onSucceed) {
    connexionBDD.query('INSERT INTO user(login,password) VALUES(?,?)', [login, password], function (err, results) {
        if (err) {
            throw err;
        }
        else {
            console.log('Inscription d\'un nouveau utilisateur. login : ' + login);
        }
    });
    if (onSucceed != undefined) onSucceed();
}

exports.insertSlide = function (connexionBDD, slideTitle, slideType, startDate, startTime, endDate, endTime, slideImportance, slideAudience, slideText, imageUrl, videoUrl, idUser, callback) {
    var nullvalue = "null";
    if (slideType === 'text') {
        imageUrl = nullvalue;
        videoUrl = nullvalue;
    }
    else if (slideType === 'textimage') {
        videoUrl = nullvalue;
    }
    else if (slideType === 'image') {
        slideText = nullvalue;
        videoUrl = nullvalue;
    }
    else if (slideType === 'video') {
        imageUrl = nullvalue;
        slideText = nullvalue;
    }

    connexionBDD.query('INSERT INTO `slide`(`titre`, `type`, `date_debut`, `time_debut`, `date_fin`, `time_fin`, `importance`, `audience`, `texte`, `image_url`, `video_url`, `id_user`)  VALUES(?,?,?,?,?,?,?,?,?,?,?,?)',
        [slideTitle, slideType, startDate, startTime, endDate, endTime, slideImportance, slideAudience, slideText, imageUrl, videoUrl, idUser], function (err, results) {
            if (err) throw err;
            else {
                callback(results["insertId"]);
            }
        });
}


exports.createAudience = function (connexionBDD, intitule, onSucceed) {
    connexionBDD.query('INSERT INTO `audience`(`intitule`) VALUES (?)', [intitule], function (err, result) {
        if (result && result.insertId) {
            if (onSucceed)
                onSucceed();
        }
    });
}
