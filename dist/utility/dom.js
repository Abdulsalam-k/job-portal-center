export const DomUtil = {
    $(selector, parent = document) {
        return parent.querySelector(selector);
    },
    $$(selector, parent = document) {
        return parent.querySelectorAll(selector);
    },
    createElement(tagName, className, innerHTML) {
        const el = document.createElement(tagName);
        if (className)
            el.className = className;
        if (innerHTML !== undefined)
            el.innerHTML = innerHTML;
        return el;
    }
};
