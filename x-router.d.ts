/**
 * Simple application router for SPA-style routing.
 *
 * URL pattern matching is based off of in-development URLPattern API.
 * See https://developer.mozilla.org/en-US/docs/Web/API/URL_Pattern_API
 */
export class XRouter {
    /**
     * @typedef {object} ParseResult
     * @property {RegExp} regex
     * @property {string[]} tokens
     */
    /**
     * @callback routeCallback
     * @param {URL} url
     * @param {Map} params
     * @return {any}
     */
    /**
     * @typedef {object} Route
     * @property {string} pattern
     * @property {routeCallback} callback
     * @property {RegExp} regex
     * @property {string[]} tokens
     */
    /** @type {Map<string, Route>} */
    static "__#3@#patterns": Map<string, {
        pattern: string;
        callback: (url: URL, params: Map<any, any>) => any;
        regex: RegExp;
        tokens: string[];
    }>;
    /** @type {routeCallback} */
    static "__#3@#wildcard": (url: URL, params: Map<any, any>) => any;
    /**
     * Set a pattern and an associated callback.
     *
     * @param {string} pattern
     * @param {routeCallback} callback
     */
    static set(pattern: string, callback: (url: URL, params: Map<any, any>) => any): void;
    /**
     * Find the best match. Match with fewest params is prioritized.
     *
     * @param {URL} url
     * @returns {{route: Route, params: Map<string, any>}}
     */
    static match(url: URL): {
        route: {
            pattern: string;
            callback: (url: URL, params: Map<any, any>) => any;
            regex: RegExp;
            tokens: string[];
        };
        params: Map<string, any>;
    };
    /**
     * Resolve object to url. For now, Router can only resolve click events.
     *
     * @param {KeyboardEvent} event
     * @returns {undefined|URL}
     */
    static resolve(event: KeyboardEvent): undefined | URL;
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
     * @returns {ParseResult}
     */
    static parse(pattern: string): {
        regex: RegExp;
        tokens: string[];
    };
}
//# sourceMappingURL=x-router.d.ts.map