var actualDateBalise = document.getElementById('actualDate');
updateDate(actualDateBalise);
window.setInterval(function () {
    updateDate(actualDateBalise)
}, 1000);

var instantMessage = document.getElementsByClassName('instantMessage')[0];
if (typeof instantMessage !== 'undefined') {
    instantMessage.addEventListener('click', function () {
        instantMessage.style.display = 'none';
    });


    setTimeout(function () {
        instantMessage.style.display = 'none';
    }, 5 * 1000); //5 secondes
}

/**
 *  Cette fonction permet de créer un element (p, div, header....)
 *  avec les attributs données. attributes doit être un tableau
 *  de la forme [['id','foo'],['class','bar'],['for','foo2']].
 *  Le textNode est un texte qui sera inséré dans la balise.
 */
function createCompleteElement(elementName, attributes, textNode) {
    var el = document.createElement(elementName);

    if (attributes) {
        for (var i = 0; i < attributes.length; i++) {
            el.setAttribute(attributes[i][0], attributes[i][1]);
        }
    }
    if (textNode)
        el.appendChild(document.createTextNode(textNode));
    return el;
}


function createSchedulingElement() { //TODO : Ajouter des paramètres pour le mode édit
    var schedulingCont = createCompleteElement('div', [['class', 'scheduling']]);
    var scheduleNameInput = createCompleteElement('input', [['type', 'text'], ['name', 'nameSchedule[]'], ['class', 'nameSchedule'], ['placeholder', 'Nom de l\'événement']]);
    var scheduleDateInput = createCompleteElement('input', [['type', 'date'], ['name', 'dateSchedule[]'], ['class', 'dateSchedule']]);
    var furtherInfoTextarea = createCompleteElement('textarea', [['name', 'furtherInfosSchedule[]'], ['class', 'furtherInfosSchedule'], ['cols', 50], ['rows', 5], ['pattern', '.{1,1000}']
        , ['title', 'Ce texte doit posséder entre 1 et 1000 caractères.'], ['placeholder', 'Informations complémentaires. Vous pouvez augmenter la taille de cette zone de texte. Cliquez en bas à droite et glissez. Vous pouvez écrire au maximum 1000 caractères.']]);

    schedulingCont.appendChild(scheduleNameInput);
    schedulingCont.appendChild(scheduleDateInput);
    schedulingCont.appendChild(furtherInfoTextarea);
    return schedulingCont;
}

function genAlertBox(title, question, text, actionIfYes, actionIfNo) {
    var alertBox = createCompleteElement('div', [['class', 'alertBox']]);
    var alertBoxTitle = createCompleteElement('div', [['class', 'title']], title);
    var alertBoxContent = createCompleteElement('div', [['class', 'content']]);
    var alertBoxContentTitle = createCompleteElement('h1', [], question);
    var alertBoxContentText = createCompleteElement('p', [], text);
    var choice = createCompleteElement('div', [['class', 'choice']]);
    var choiceYes = createCompleteElement('label', [], "OUI");
    var choiceNo = createCompleteElement('label', [], "NON");
    choice.appendChild(choiceYes);
    choice.appendChild(choiceNo);

    alertBoxContent.appendChild(alertBoxContentTitle);
    alertBoxContent.appendChild(alertBoxContentText);

    alertBox.appendChild(alertBoxTitle);
    alertBox.appendChild(alertBoxContent);
    alertBox.appendChild(choice);

    choiceYes.addEventListener('click', function () {
        if (actionIfYes)
            actionIfYes();
    });
    choiceNo.addEventListener('click', function () {
        if (actionIfNo)
            actionIfNo();
    });

    return alertBox;
}

function getColorByImportance(importance) {
    switch (importance) {
        case 'infoRapide':
            return 'darkblue';
            break;
        case 'infoSimple':
            return 'turquoise';
            break;
        case 'infoImportante':
            return 'orange';
            break;
        case 'infoUrgente':
            return 'red';
            break;
        default:
            return 'green';
            break;
    }
}


/**** MANIPULATION STRINGS & DATE ****/

/** Transformer un objet Date en une chaîne
 * de caractères lisible
 */
function fromDateTypeToHumanReadable(date) {
    var newDate = new Date(date.splice(10, 0, "T"));
    return newDate.toLocaleDateString() + " " + newDate.getUTCHours() + ":" + newDate.getUTCMinutes();
}

/**
 * Cette fonction permet de mettre à jour le texte
 * à l'intérieur d'un element donné. Le texte inséré
 * est la date actuelle au format jj/mm/yyyy hh:mm:ss
 */
function updateDate(elem) {
    var now = new Date(Date.now());
    var nowYear = now.getFullYear();
    var nowMonth = now.getMonth() + 1;
    var nowDay = now.getUTCDate();
    var nowHour = now.getHours();
    var nowMinut = now.getMinutes();
    var nowSecond = now.getSeconds();
    nowMonth = (nowMonth < 10) ? "0" + nowMonth : nowMonth;
    nowDay = (nowDay < 10) ? "0" + nowDay : nowDay;
    nowHour = (nowHour < 10) ? "0" + nowHour : nowHour;
    nowMinut = (nowMinut < 10) ? "0" + nowMinut : nowMinut;
    nowSecond = (nowSecond < 10) ? "0" + nowSecond : nowSecond;

    var textDate = document.createTextNode(nowDay + "/" + nowMonth + "/" + nowYear + " " + nowHour + ":" + nowMinut + ":" + nowSecond);
    if (elem) {
        if (elem.firstChild) {
            elem.removeChild(elem.firstChild);
        }
        elem.appendChild(textDate);
    }
}

/** Prototype pour ajouter une chaîne de caractère dans une autre à un index donné */
String.prototype.splice = function (idx, rem, s) {
    return (this.slice(0, idx) + s + this.slice(idx + Math.abs(rem)));
};

/**** CREATION DE SLIDES ****/
function createSlide(slide, isAnimated, isPreview) {
    //id type titre texte image_url video_url importance date_debut  time_debut date_fin  time_fin plannings
    var s;
    var pathToDir = "/UserPictures/";
    var preview = (isPreview) ? true : false;
    var image_url = (preview) ? "/IMG-VID/previewslideimage.png" : pathToDir + slide.image_url;

    if (slide.type === 'text' && slide.text !== null) {
        s = createTextSlide(slide.titre, slide.texte);
    }
    else if (slide.type === 'planning') {
        s = createPlanningSlide(slide.titre, slide.plannings);
    }
    else if (slide.image_url !== null) {
        if (slide.type === 'textimage') {
            s = createTextImageSlide(slide.titre, slide.texte, image_url);
        }
        else if (slide.type === 'image') {
            s = createImageSlide(slide.titre, image_url);
        } else {
            return null;
        }
    }
    else {
        return null;
    }
    if (s) {
        if (isAnimated)
            s.classList.add("appear");

        //Ajout de l'attribut id
        s.setAttribute('idslide', slide.id);
        //Ajout de l'importance
        s.setAttribute('importanceslide', slide.importance);
        //Ajout de la class couleur en fonction de l'importance du slide
        s.classList.add(getColorByImportance(slide.importance));
        //Ajout du bouton de suppression
        var supButton = createCompleteElement('a', [['class', 'deleteButton'], ['href', '#']]);
        supButton.addEventListener('click', function () {
            var alertBox = genAlertBox("Suppression d'un slide", "Voulez-vous vraiment supprimer ce slide ?", "Si oui, il sera supprimé de cet écran mais aussi de tous les autres écrans.", function () {
                window.location.href = "/deleteSlide/" + slide.id;
            }, function () {
                alertBox.parentNode.removeChild(alertBox);
            });
            (document.getElementsByTagName('body')[0]).appendChild(alertBox);
        });
        (s.getElementsByClassName('top')[0]).appendChild(supButton);

        //Ajout de la date de commencement et d'expiration en tant qu'attributs
        s.setAttribute("startDate", slide.date_debut + "T" + slide.time_debut);
        s.setAttribute("endDate", slide.date_fin + "T" + slide.time_fin);

        return s;
    }
}

function createTextSlide(titre, texte) {
    //	.slide>(.top+textContent>P)
    var slide = document.createElement("div");
    slide.classList.add("slide");
    slide.classList.add("slideTextImage");

    var top = document.createElement("div");
    top.classList.add("top");
    top.appendChild(document.createTextNode(titre));

    var content = document.createElement("div");
    content.classList.add("content");

    var tabTexte = texte.split("\n");
    for (var i = 0; i < tabTexte.length; i++) {

        var texteP = document.createElement("p");
        texteP.appendChild(document.createTextNode(tabTexte[i]));

        content.appendChild(texteP);

    }

    slide.appendChild(top);
    slide.appendChild(content);
    return slide;
}

function createTextImageSlide(titre, texte, imageURL) {
    var slide = document.createElement("div");
    slide.classList.add("slide");
    slide.classList.add("slideTextImage");

    var top = document.createElement("div");
    top.classList.add("top");
    top.appendChild(document.createTextNode(titre));

    var content = document.createElement("div");
    content.classList.add("content");

    var imgContent = document.createElement("img");
    imgContent.setAttribute("src", imageURL);

    var texteP = document.createElement("p");
    texteP.appendChild(document.createTextNode(texte));

    content.appendChild(imgContent);
    content.appendChild(texteP);

    slide.appendChild(top);
    slide.appendChild(content);
    return slide;
}

function createImageSlide(titre, imageURL) {
    var slide = document.createElement("div");
    slide.classList.add("slide");
    slide.classList.add("slideImage");

    var top = document.createElement("div");
    top.classList.add("top");
    top.appendChild(document.createTextNode(titre));

    var imgContent = document.createElement("img");
    imgContent.setAttribute("src", imageURL);
    var tmpImg = new Image();
    tmpImg.setAttribute("src", imageURL);
    tmpImg.onload = function () {
        imgContent.setAttribute('height', 'auto');
        imgContent.setAttribute('width', tmpImg.width + "px");
    };

    slide.appendChild(top);
    slide.appendChild(imgContent);
    return slide;
}

function createPlanningSlide(titre, planning) {
    console.log(titre);
    console.log(planning);
    planning = typeof planning.length === "number" ? planning : [planning];
    var allPlanningsElements = [];

    var slide = document.createElement("div");
    slide.classList.add("slide");
    slide.classList.add("slidePlanning");

    var top = document.createElement("div");
    top.classList.add("top");
    top.appendChild(document.createTextNode(titre));

    var content = document.createElement("div");
    content.classList.add("content");


    for (var i = 0; i < planning.length; i++) {
        var scheduleContent = createCompleteElement('div', [['class', 'scheduleContent']]);
        var firstLineContainer = createCompleteElement('div');
        var scheduleDate = createCompleteElement('div', [['class', 'scheduleDate']], planning[i].date);
        var scheduleName = createCompleteElement('div', [['class', 'scheduleName']], planning[i].name);
        var scheduleFurtherInfos = createCompleteElement('div', [['class', 'scheduleFurtherInformations']], planning[i].further);
        firstLineContainer.appendChild(scheduleDate);
        firstLineContainer.appendChild(scheduleName);
        scheduleContent.appendChild(firstLineContainer);
        scheduleContent.appendChild(scheduleFurtherInfos);

        allPlanningsElements.push(scheduleContent);
        content.appendChild(scheduleContent);
    }

    slide.appendChild(top);
    slide.appendChild(content);
    return slide;
}

/**** CREATION DE CONTAINER ****/
function createContainer() {
    var container = document.createElement("div");
    container.classList.add("slideShowContainer");
    return container;
}

/**** GESTION DE CONTAINER ****/
function insertSlideInContainer(slide) {
    //Ajouter un slide dans le container

    //On insère un slide seulement s'il n'est pas déjà présent
    //un slide est considéré comme déjà présent s'il existe déjà un
    //slide porteur du même id à l'écran
    var slides = document.getElementsByClassName('slide');
    var i = 0, estDejaPresent = false;
    while (i < slides.length && !estDejaPresent) {
        if (slide.getAttribute('idslide') == slides[i].getAttribute('idslide')) {
            estDejaPresent = true;
        }
        i++;
    }
    if (estDejaPresent == false) {
        if (nbSlideFirstColumn == 0) {//Si la premiere colonne n'a aucun slide, alors elle reçoit le slide à ajouter
            firstColumn.appendChild(slide);
            nbSlideFirstColumn++;
        }
        else if (nbSlideSecondColumn == 0) {//Sinon si la seconde colonne n'a aucun slide, alors elle reçoit le slide à ajouter
            secondColumn.appendChild(slide);
            nbSlideSecondColumn++;
        }
        else {//Sinon on insère de sorte à avoir la même hauteur des deux côtés
            /** TODO Problème identifié, les images arrivent souvent après le placement des balises et donc cela fausse
             * TODO le calcul des hauteurs. Solution : Initialiser la hauteur des balises en fonction de la taille des images */
            var offsetLastElemFirstCol = offset(firstColumn.lastChild);
            var offsetLastElemSecCol = offset(secondColumn.lastChild);
            if (offsetLastElemFirstCol.bottom <= offsetLastElemSecCol.bottom) {
                firstColumn.appendChild(slide);
                nbSlideFirstColumn++;
            }
            else if (offsetLastElemFirstCol.bottom > offsetLastElemSecCol.bottom) {
                secondColumn.appendChild(slide);
                nbSlideSecondColumn++;
            }
        }
    }
}

function isContainerScrolling(nieme) {
    //Verifier s'il y a trop d'éléments dans le n-ième (0...n) container et
    // que les barres de scrolls sont affichés
    return containers[nieme].scrollHeight > containers[nieme].clientHeight;
}


/**
 * Cette fonction verifie si un des slides de la page
 * est expiré. Si oui, le slide est supprimé du DOM
 * et un ordre de suppression est donné au serveur.
 */
function checkExpirationAllSlides() {
    var slides = document.getElementsByClassName('slide');
    //Pour chaque slide, on verifie s'il est toujours valable
    for (var i = 0; i < slides.length; i++) {
        if (estExpire(slides[i].getAttribute('enddate'))) {
            //Le slide est bien expiré
            removeSpecificSlide(slides[i], true);
            // Pas besoin d'avertir le serveur, chaque client va remarquer tout seul que le slide est expiré
            // et pour les nouveaux clients, le slide sera expiré donc non-selectionné.
            slides = document.getElementsByClassName('slide');
        }
    }
}

function estExpire(dateFin) {
    var now = new Date(Date.now());
    var endDate = new Date(dateFin);
    endDate.setHours(endDate.getUTCHours());
    if (endDate.getTime() <= now.getTime()) {
        return true;
    }
    else {
        return false;
    }

}

/**
 * Cette fonction supprime un slide du DOM et
 * donne l'ordre au serveur de le supprimer de la BDD.
 * Le second paramètre indique si oui on non il faut
 * avertir le serveur de la suppression du slide.
 */
function removeSpecificSlide(slide, avertServeur) {
    slide.classList.add("disappear");
    if (avertServeur)
        socket.emit('setSlideExpire', {id: slide.getAttribute('idslide')});

    setTimeout(function () {
        if (slide.parentNode == firstColumn) {
            firstColumn.removeChild(slide);
            nbSlideFirstColumn--;
        }
        else if (slide.parentNode == secondColumn) {
            secondColumn.removeChild(slide);
            nbSlideSecondColumn--;
        }
    }, timeForSlideToDisappear);
}

/**
 * Recuperer les position haute des slides d'une
 * colonne donné. Chaque valeur est arrondie au plus
 * proche pour faciliter la manipulation.
 */
function getAllTopOffsetsColumn(column) {
    var slides = column.getElementsByClassName('slide');
    var offsets = [];
    for (var i = 0; i < slides.length; i++) {
        offsets[i] = Math.round(offset(slides[i]).top);
    }
    return offsets;
}

/**
 * Recuperer la position d'un element donné.
 */
function offset(elt) {
    if (elt) {
        var rect = elt.getBoundingClientRect(), bodyElt = document.body;
        return {
            top: rect.top + bodyElt.scrollTop,
            left: rect.left + bodyElt.scrollLeft,
            bottom: (rect.top + bodyElt.scrollTop) + rect.height,
            right: (rect.left + bodyElt.scrollLeft) + rect.width
        }
    }
}


/*** MANIPULATION DES COLONNES ****/
function moveFirstColumnUp() {
    if (nbSlideFirstColumn > 0) {
        var slidesOffsets = getAllTopOffsetsColumn(firstColumn);
        var pos = getColumnPosition(firstColumn);

        var lastSlide = firstColumn.getElementsByClassName('slide');
        lastSlide = lastSlide[lastSlide.length - 1];
        //On ne scroll que si le bas du dernier slide n'est affiché à l'écran
        if ((offset(lastSlide).bottom) > window.innerHeight - bottomHeight) {//Si le dernier slide n'est pas complètement à l'écran
            firstColumn.style.top = (pos - 1) + "px";
            if (slidesOffsets.indexOf(0) == -1) //Aucun slide n'a atteint le haut
            {
                setTimeout(moveFirstColumnUp, speedScroll);
            }
            else {
                setTimeout(moveSecondColumnUp, timeToWaitBetweenEachSlides);
            }
        }
        else {//Si le dernier slide est complètement affiché à l'écran
            //On attend un moment avant de réinitialiser la position de cette colonne
            setTimeout(moveSecondColumnUp, timeToWaitBetweenEachSlides);
            setTimeout(function () {
                firstColumn.style.top = "0px";
            }, timeToWaitEndOfScroll);
        }
    }
}

function moveSecondColumnUp() {
    if (nbSlideSecondColumn > 0) {
        var slidesOffsets = getAllTopOffsetsColumn(secondColumn);
        var pos = getColumnPosition(secondColumn);
        var lastSlide = secondColumn.getElementsByClassName('slide');
        lastSlide = lastSlide[lastSlide.length - 1];
        //On ne scroll que si le dernier slide n'est pas à l'écran

        if ((offset(lastSlide).bottom) > window.innerHeight - bottomHeight) {
            secondColumn.style.top = (pos - 1) + "px";
            if (slidesOffsets.indexOf(0) == -1) {
                //Si aucun slide n'a atteint le haut
                //Alos on continue de faire monter cette colonne
                setTimeout(moveSecondColumnUp, speedScroll);
            }
            else {
                setTimeout(moveFirstColumnUp, timeToWaitBetweenEachSlides);
            }
        }
        else {//Si le dernier slide est complètement affiché à l'écran
            //On attend un moment avant de réinitialiser la position de cette colonne
            setTimeout(moveFirstColumnUp, timeToWaitBetweenEachSlides);
            setTimeout(function () {
                secondColumn.style.top = "0px";
            }, timeToWaitEndOfScroll);
        }
    }
}

/**
 * Obtenir la position haute d'une
 * colonne donnée sans le "px" à la fin.
 */
function getColumnPosition(col) {
    var pos = col.style.top;
    pos = (pos[pos.length - 1] == 'x' && pos[pos.length - 2] == 'p') ? pos.slice(0, pos.length - 2) : pos;
    return pos;
}


/**
 *  Recharger tous les slides d'audience donnée
 *  et vide le contenu de la liste des slides du bandeau de défilement de texte
 */
function EraseAndLoadSlides(idAudience) {
    while (firstColumn.firstChild) {
        firstColumn.removeChild(firstColumn.firstChild);
        nbSlideFirstColumn--;
    }
    while (secondColumn.firstChild) {
        secondColumn.removeChild(secondColumn.firstChild);
        nbSlideSecondColumn--;
    }
    textsToStream = [];
    iterator = 0;
    socket.emit('getSlides', {audience: idAudience});
}


function streamText() {
    var pos = getTextLeftPosition(textInStream);
    if (pos == posInit) {
        moveStreamToLeft(pos, endPos);
    }
}

function nextTextStream() {
    if (textsToStream.length == 0) { //S'il n'y a pas/plus de texte à faire defiler,
        // on attend une seconde pour revérifier
        textInStream.innerHTML = "";
        setTimeout(nextTextStream, 1000);
    }
    else if (estExpire(textsToStream[iterator].date_fin + "T" + textsToStream[iterator].time_fin)) {
        //Si le slide a atteint sa date d'expiration, il est retiré de la liste et on passe au slide suivant
        textsToStream.splice(iterator, 1);
        iterator = (iterator + 1) % textsToStream.length;
        nextTextStream();
    }
    else {
        posInit = textStream.clientWidth; //recalcul in case of resizing
        textInStream.innerHTML = textsToStream[iterator].texte;
        textStreamWidth = textInStream.offsetWidth;
        endPos = textStreamWidth * -1;
        textInStream.style.left = posInit + "px";

        iterator = (iterator + 1) % textsToStream.length;
        streamText();
    }
}

function moveStreamToLeft(currentPos, finalPos) {
    if (finalPos >= currentPos) { //Le texte actuel a fini de défiler
        nextTextStream(); //Passer au texte suivant
    }
    else {//Le texte a encore besoin de defiler
        textInStream.style.left = (currentPos - 1) + "px";
        setTimeout(function () {
            moveStreamToLeft(currentPos - 1.25, finalPos);
        }, 1);
    }
}
function getTextLeftPosition(p) {
    var pos = p.style.left;
    pos = (pos[pos.length - 1] == 'x' && pos[pos.length - 2] == 'p') ? pos.slice(0, pos.length - 2) : pos;
    return pos;
}


function addToTextStream(slide) {
    //Si l'importance correspond à celle du bandeau de texte
    if (slide.importance == 'infoImportante' || slide.importance == 'infoUrgente') {	//Si le type correspond à un type ayant du texte
        if (slide.type == 'text' || slide.type == 'textimage') {
            //si le slide cible la même audience que celle selectionnée par l'utilisateur
            if (slide.audience == selectedAudience || selectedAudience == 0 || slide.audience == 0) {
                if (slide.texte != "") //Si le slide contient bien du texte
                {
                    if (!(textsToStream.indexOf(slide.id) > -1)) //Si le slide n'est pas déjà present dans la liste
                    {
                        textsToStream.push(slide);
                    }
                }
            }
        }
    }
}

/**** FULLSCREEN CONTROL ****/
function launchIntoFullscreen(element) {
    if (element.requestFullscreen) {
        element.requestFullscreen();
    } else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
    } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) {
        element.msRequestFullscreen();
    }
}
function exitFullscreen() {
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
    }
}


function getCurrentUrl() {
    var arrayURL = document.location.href.split('/');
    var currentURL = arrayURL[0] + "/" + arrayURL[1] + "/" + arrayURL[2];
    return currentURL;
}


function associateSlideWithPlannings(slides, plannings) {
    var outObj = [];
    for (var s = 0; s < slides.length; s++) {
        var slide = slides[s];
        if (slide.type == "planning") {
            //Search all plannings associated to this slide
            slide.plannings = [];
            for (var p = 0; p < plannings.length; p++) {
                var planning = plannings[p];
                if (slide.id == planning.IdtSli_Pla) {
                    slide.plannings.push(planning);
                }
            }
        }
        outObj.push(slide);
    }
    console.log(outObj);
    return outObj;
}