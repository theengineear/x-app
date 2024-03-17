/**
 * Simple application router for SPA-style routing.
 *
 * URL pattern matching is based off of in-development URLPattern API.
 * See https://developer.mozilla.org/en-US/docs/Web/API/URL_Pattern_API
 */
export class XRouter {
    /**
     * @typedef {regex: RegExp, tokens: string[]} XRouter~parseResult
     */
    /**
     * @typedef { pattern: string, callback: XRouter~routeCallback, regex: RegExp, tokens: string[] } XRouter~route
     */
    /** @type {Map<string, XRouter~route>} */
    static "__#4@#patterns": Map<string, (url: URL, params: Map<any, any>) => any>;
    /**
     * @callback XRouter~routeCallback
     * @param {URL} url
     * @param {Map} params
     *
     * @returns {any}
     */
    /** @type {XRouter~routeCallback} */
    static "__#4@#wildcard": (url: URL, params: Map<any, any>) => any;
    /**
     * Set a pattern and an associated callback.
     *
     * @param {string} pattern
     * @param {XRouter~routeCallback} callback
     */
    static set(pattern: string, callback: any): void;
    /**
     * Find the best match. Match with fewest params is prioritized.
     *
     * @param {URL} url
     * @returns {{route: unknown, params: Map<any, any>}}
     */
    static match(url: URL): {
        route: unknown;
        params: Map<any, any>;
    };
    /**
     * Resolve object to url. For now, Router can only resolve click events.
     *
     * @param {Event} event
     * @returns {undefined|URL}
     */
    static resolve(event: Event): undefined | URL;
    /**
     * Use the current location to update the route.
     *
     * @returns {void}
     */
    static read(): void;
    /**
     * Parse a route pattern. E.g., "/foo/:fooId/bar/:barTab".
     *
     * @param {string} pattern
     * @throws Throws for invalid input.
     * @returns {XRouter~parseResult}
     */
    static parse(pattern: string): (url: URL, params: Map<any, any>) => any;
}
//# sourceMappingURL=x-router.d.ts.map