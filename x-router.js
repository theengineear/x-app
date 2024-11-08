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
  static #patterns = new Map();

  /** @type {routeCallback} */
  static #wildcard = (url, params) => {}; // eslint-disable-line no-unused-vars

  /**
   * Set a pattern and an associated callback.
   * 
   * @param {string} pattern
   * @param {routeCallback} callback
   */
  static set(pattern, callback) {
    if (pattern === '*') {
      XRouter.#wildcard = callback;
    } else {
      const { regex, tokens } = XRouter.parse(pattern);
      XRouter.#patterns.set(pattern, { pattern, callback, regex, tokens });
    }
  }

  /**
   * Find the best match. Match with fewest params is prioritized.
   * 
   * @param {URL} url
   * @returns {{route: Route, params: Map<string, any>}}
   */
  static match(url) {
    if (url.origin === window.location.origin) {
      const route = Array.from(XRouter.#patterns.values())
        .filter(candidate => url.pathname.match(candidate.regex))
        .reduce((acc, cur) => (!acc || acc.tokens.length > cur.tokens.length ? cur : acc), null);
      if (route) {
        const params = new Map();
        const captures = url.pathname.match(route.regex).slice(1).entries();
        for (const [index, capture] of captures) {
          params.set(route.tokens[index], capture);
        }
        return { route, params };
      }
    }
  }

  /**
   * Resolve object to url. For now, Router can only resolve click events.
   * 
   * @param {KeyboardEvent} event
   * @returns {undefined|URL}
   */
  static resolve(event) {
    if (
      event instanceof Event &&
      event.type === 'click' &&
      (!event.shiftKey && !event.ctrlKey && !event.metaKey && !event.altKey)
    ) {
      const link = event.composedPath().find(element => (
        element instanceof HTMLAnchorElement
      ));
      if (link && link.href && (!link.target || link.target === '_self')) {
        const url = new URL(link.href);
        if (XRouter.match(url)) {
          return url;
        }
      }
    }
  }

  /**
   * Use the current location to update the route.
   * 
   * @returns {void}
   */
  static read() {
    const url = new URL(location.href);
    const match = this.match(url);
    if (match) {
      match.route.callback(url, match.params);
    } else {
      XRouter.#wildcard(url, new Map());
    }
  }

  /**
   * Parse a route pattern. E.g., "/foo/:fooId/bar/:barTab".
   * 
   * @param {string} pattern
   * @throws Throws for invalid input.
   * @returns {ParseResult}
   */
  static parse(pattern) {
    const paramRegex = /:[^\s^+/]+\+?/g;
    const stringToType = string => string.endsWith('+') ? 'repeat' : 'basic';
    const tokens = [];
    for (const string of pattern.match(paramRegex) ?? []) {
      let token;
      switch (stringToType(string)) {
        case 'basic':
          token = string.slice(1);
          break;
        case 'repeat':
          token = string.slice(1, -1);
          break;
        default:
          throw new Error(`Unexpected string "${string}".`);
      }
      if (tokens.includes(token)) {
        throw new Error(`Ambiguous parameter name "${token}"`);
      }
      tokens.push(token);
    }
    const replacer = string => {
      let replacement;
      switch (stringToType(string)) {
        case 'basic':
          replacement = '([^/^?^#]+)';
          break;
        case 'repeat':
          replacement = '([^?^#]+)';
          break;
        default:
          throw new Error(`Unexpected string "${string}".`);
      }
      return replacement;
    };
    const regex = new RegExp(`^${pattern.replace(paramRegex, replacer)}$`);
    return { regex, tokens };
  }
}
