
/**
 * Extend a child object with parent's methods and properties
 * @param parent
 * @param child
 */
function extend(parent, child) {
    child.prototype = Object.create(parent.prototype);
    child.prototype.constructor = child;
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

