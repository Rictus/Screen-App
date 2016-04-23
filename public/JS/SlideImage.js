var SlideImage = function (title, image_url) {
    Slide.call(this, Slide_Type.IMAGE);
    this.title = title;
    this.image_url = image_url;
    this.img = null;
    this.buildSlide();
};

extend(Slide, SlideImage);

SlideImage.prototype.buildSlide = function () {
    this.buildBase();
    this.top.appendChild(document.createTextNode(this.title));
    this.img = document.createElement('img');
    this.img.setAttribute('src', this.image_url);
    this.element.appendChild(top);
    this.element.appendChild(img);
};