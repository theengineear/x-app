/**
 * Helper to switch between separate HTML tag names and bind properties.
 */
export class XSwitch extends HTMLElement {
    static get observedAttributes(): string[];
    /**
     * Set the HTML element tag that should be stamped into the DOM.
     *
     * @param {any} value
     */
    set tag(value: any);
    /**
     * Get the turn HTML element tag being rendered (if any).
     *
     * @returns {any}
     */
    get tag(): any;
    /**
     * Set the properties to bind to the element managed by this switch wrapper.
     *
     * @param {any} value
     */
    set properties(value: any);
    /**
     * Set the properties bound to the element managed by this switch wrapper.
     *
     * @returns {any}
     */
    get properties(): any;
    /**
     * Trigger a render to update the DOM
     *
     * @returns {void}
     */
    render(): void;
    connectedCallback(): void;
    attributeChangedCallback(name: any, oldValue: any, newValue: any): void;
    #private;
}
//# sourceMappingURL=x-switch.d.ts.map