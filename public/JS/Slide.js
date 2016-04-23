var Slide = function (type, importance, startDate, endDate, slideId) {
    this.type = type;
    //todo Method delete
    this.element = null;
    this.top = null;
    this.content = null;
    this.importance = importance;
    this.startDate = startDate;
    this.endDate = endDate;
    this.supButton = null;
    this.id = slideId;
};

/**
 * Constuire la base de tout slide :
 * element > (top + content)
 */
Slide.prototype.buildBase = function () {
    this.element = document.createElement('div');
    this.element.classList.add(this.type.className);
    this.element.classList.add(getColorByImportance(this.importance));
    this.top = document.createElement('div');
    this.top.classList.add('top');
    this.content = document.createElement('div');
    this.content.classList.add('content');
    this.supButton = createCompleteElement('a', [['class', 'deleteButton'], ['href', '#']]);

    var that = this;
    this.supButton.addEventListener('click', function () {
        var alertBox = genAlertBox("Supprimer un slide", "Voulez-vous vraiment supprimer ce slide ?", "Si oui, il sera supprimé de cet écran mais aussi de tous les autres écrans.", function () {
            window.location.href = "/deleteSlide/" + that.id;
        }, function () {
            alertBox.parentNode.removeChild(alertBox);
        });
        (document.getElementsByTagName('body')[0]).appendChild(alertBox);
    });
    this.top.appendChild(this.supButton);

    this.element.appendChild(this.top);
    this.element.appendChild(this.content);
};


