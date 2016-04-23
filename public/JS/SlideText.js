var SlideText = function (title, text) {
    Slide.call(this, Slide_Type.TEXT);
    this.title = title;
    this.text = text;
    this.buildSlide();
};

extend(Slide, SlideText);

SlideText.prototype.buildSlide = function () {

    this.buildBase();
    this.top.appendChild(document.createTextNode(this.title));

    var tabTexte = this.text.split("\n");
    for (var i = 0; i < tabTexte.length; i++) {
        var texteP = document.createElement("p");
        texteP.appendChild(document.createTextNode(tabTexte[i]));
        this.content.appendChild(texteP);
    }

    this.element.appendChild(top);
    this.element.appendChild(content);
};