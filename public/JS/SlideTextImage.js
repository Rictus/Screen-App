var SlideTextImage = function (title, text, image_url) {
    Slide.call(this, Slide_Type.TEXTIMAGE);
    this.title = title;
    this.text = text;
    this.image_url = image_url;
    this.img = null;
    this.buildSlide();
};

extend(Slide, SlideTextImage);

SlideTextImage.prototype.buildSlide = function () {
    this.buildBase();
    this.top.appendChild(document.createTextNode(this.title));
    this.img = document.createElement('img');
    this.img.setAttribute("src", this.image_url);
    var texteP = document.createElement("p");
    texteP.appendChild(document.createTextNode(this.text));
    this.content.appendChild(this.img);
    this.content.appendChild(texteP);
    this.element.appendChild(this.top);
    this.element.appendChild(this.content);
};