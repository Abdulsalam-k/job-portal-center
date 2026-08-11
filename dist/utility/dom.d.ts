export declare const DomUtil: {
    $<T extends HTMLElement>(selector: string, parent?: Document | HTMLElement): T | null;
    $$(selector: string, parent?: Document | HTMLElement): NodeListOf<HTMLElement>;
    createElement<K extends keyof HTMLElementTagNameMap>(tagName: K, className?: string, innerHTML?: string): HTMLElementTagNameMap[K];
};
//# sourceMappingURL=dom.d.ts.map