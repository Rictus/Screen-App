var Slide_Type = {
    TEXT: {
        title: "TEXT",
        className: "slideText",
        constructor: SlideText
    },
    IMAGE: {
        title: "IMAGE",
        constructor: SlideText
    },
    TEXTIMAGE: {
        title: "TEXTIMAGE",
        constructor: SlideText
    },
    hasProperty: function(prop){
        return (typeof this.prop !== "function");
    },
    toString: function(prop){
        return prop.title;
    }

};