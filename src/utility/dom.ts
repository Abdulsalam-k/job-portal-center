/**
 * DOM Utility
 * Provides safe type-checked selectors and UI helper functions.
 */

export const DomUtil = {
    $<T extends HTMLElement>(selector: string, parent: Document | HTMLElement = document): T | null {
        return parent.querySelector<T>(selector);
    },

    $$(selector: string, parent: Document | HTMLElement = document): NodeListOf<HTMLElement> {
        return parent.querySelectorAll<HTMLElement>(selector);
    },

    createElement<K extends keyof HTMLElementTagNameMap>(tagName: K, className?: string, innerHTML?: string): HTMLElementTagNameMap[K] {
        const el = document.createElement(tagName);
        if (className) el.className = className;
        if (innerHTML !== undefined) el.innerHTML = innerHTML;
        return el;
    }
};