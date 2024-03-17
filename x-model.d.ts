/**
 * Provides helper functions for non-mutating, deep object manipulation.
 */
export class Deep {
    /** @type {Map<string, string[]>} */
    static "__#1@#pathToKeysMap": Map<string, string[]>;
    /** @type {symbol} */
    static "__#1@#DELETE_SENTINEL": symbol;
    /**
     * @param {any} object
     * @returns {boolean}
     */
    static "__#1@#isObject"(object: any): boolean;
    /**
     * @param {any} object
     * @param {any} key
     * @returns {boolean}
     */
    static "__#1@#hasKey"(object: any, key: any): boolean;
    /**
     * @param {any} object
     * @param {any} key
     * @returns {any}
     */
    static "__#1@#getKey"(object: any, key: any): any;
    /**
     * @param {any} key
     * @returns {[]|{}}
     */
    static "__#1@#getNext"(key: any): [] | {};
    /**
     * Split a path DSL into separate keys.
     * @param {string} path
     * @throws Throws an error if path isn’t a string.
     * @returns {string[]}
     */
    static pathToKeys(path: string): string[];
    /**
     * @overload
     * @param {object} object
     * @param {boolean} [shallow]
     * @returns {object}
     */
    static clone(object: object, shallow?: boolean): object;
    /**
     * Deep-freeze the given value (if freezable).
     *
     * @param {any} value
     * @returns {void}
     */
    static freeze(value: any): void;
    /**
     * Deep-equality check for any two arguments (versus check-by-reference).
     *
     * @param {any} a
     * @param {any} b
     * @returns {boolean}
     */
    static equal(a: any, b: any): boolean;
    /**
     * Check if a value _exists_ at the given path.
     *
     * @param {any} object
     * @param {string} path
     * @returns {boolean}
     */
    static has(object: any, path: string): boolean;
    /**
     * Get value at the given path.
     *
     * @param {any} object
     * @param {string} path
     * @returns {any}
     */
    static get(object: any, path: string): any;
    /**
     * @overload
     * @param {object} object
     * @param {string} path
     * @param {any} value
     * @returns {object}
     */
    static set(object: object, path: string, value: any): object;
    /**
     * @overload
     * @param {object} object
     * @param {string} path
     * @returns {object}
     */
    static delete(object: object, path: string): object;
}
/**
 * A simple state store which model trees use to house application state.
 */
export class Store {
    /**
     * Updates the value of the store and deep-freezes result to prevent
     * tampering. Finally, it also queues up a notification to subscribers.
     *
     * @param {any} [newValue]
     */
    set value(newValue: any);
    /**
     * Returns the value of the store — typically a plain javascript object.
     *
     * @returns {any}
     */
    get value(): any;
    /**
     * Strict check for existence (e.g., even “undefined”).
     *
     * @returns {boolean}
     */
    hasValue(): boolean;
    /**
     * Completely unsets store “value” (see {@link hasValue}).
     *
     * @returns {void}
     */
    removeValue(): void;
    /**
     * @overload
     * @returns {boolean}
     */
    has(): boolean;
    /**
     * @overload
     * @returns {any}
     */
    get(): any;
    /**
     * @overload
     * @param {any} path
     * @returns {void}
     */
    set(path: any): void;
    /**
     * @overload
     * @param {string} path
     * @param {any} value
     * @returns {void}
     */
    set(path: string, value: any): void;
    /**
     * @overload
     * @returns {void}
     */
    remove(): void;
    /**
     * Subscribe to store changes. Latest subscriber wins.
     *
     * @param {Store~subscribeCallback} callback
     * @throws Throws an error if callback is not a function.
     * @returns {void}
     */
    subscribe(callback: any): void;
    /**
     * Mark the store as invalid, queuing a future callback to subscribers.
     *
     * @returns {Promise<void>}
     */
    invalidate(): Promise<void>;
    #private;
}
/**
 * XModel provides the following:
 *   1. Events.
 *   2. Deep object management.
 *   3. Delegated scope management.
 *
 * Note: HTMLElement lifecycle methods will not be called unless the model tree
 * is actually inserted into the DOM.
 */
export class XModel extends HTMLElement {
    /**
     * Because XModel leverages HTMLElement’s and shadow roots, we must define a
     * new tag in the custom element registry. Note that names are de-duped such
     * that XModel class names can be repeated (if necessary).
     *
     * @returns {void}
     */
    static register(): void;
    /**
     * Simple helper to de-dupe registered tag names.
     *
     * @param {string} candidate
     * @returns {string}
     */
    static "__#3@#dedupe"(candidate: string): string;
    /**
     * Initial value can be passed as input.
     *
     * @param {object} [input]
     * @returns {void}
     */
    constructor(input?: object);
    /**
     * Get the root model’s store (which may be this model’s own store if root).
     *
     * @returns {Store}
     */
    get store(): (oldValue: any, newValue: any) => any;
    /**
     * Get the value in the store which is managed by this model.
     *
     * @returns {any}
     */
    get value(): any;
    /**
     * Simple check to determine if this model is the root of the model tree.
     *
     * @returns {boolean}
     */
    get isRoot(): boolean;
    /**
     * Get the parent model object (if one exists).
     *
     * @returns {null|XModel}
     */
    get parent(): XModel;
    /**
     * Get the full path to this model from the root.
     *
     * @returns {undefined|string}
     */
    get path(): string;
    /**
     * Get the partial path that this model is mounted at relative to its parent.
     * See {@link setChild} for context.
     *
     * @returns {undefined|string}
     */
    get relativePath(): string;
    /**
     * Subscribe to store — only allowed on the root model.
     *
     * @param {Store~subscribeCallback} callback
     * @throws Throws an error if the target model is not the root model.
     * @returns {void}
     */
    subscribe(callback: any): void;
    /**
     * @overload
     * @returns {boolean}
     */
    has(): boolean;
    /**
     * @overload
     * @returns {any}
     */
    get(): any;
    /**
     * @overload
     * @param {any} relativePath
     * @returns {void}
     */
    set(relativePath: any): void;
    /**
     * @overload
     * @param {string} relativePath
     * @param {any} value
     * @returns {void}
     */
    set(relativePath: string, value: any): void;
    /**
     * Get the full path from the root of the model tree.
     *
     * @param {string} relativePath
     * @returns {string}
     */
    resolve(relativePath: string): string;
    /**
     * Check if a child model is currently mounted at the given relative path.
     *
     * @param {string} relativePath
     * @returns {boolean}
     */
    hasChild(relativePath: string): boolean;
    /**
     * Get child model mounted at the given relative path (if one exists).
     *
     * @param {string} relativePath
     * @returns {null|XModel}
     */
    getChild(relativePath: string): null | XModel;
    /**
     * Mount child model at the given relative path.
     *
     * @param {string} relativePath
     * @param {XModel} child
     * @returns {void}
     */
    setChild(relativePath: string, child: XModel): void;
    /**
     * Delete child at the given relative path (if one exists)
     *
     * @param relativePath
     * @throws Throws if a relative path is not specified.
     * @returns {void}
     */
    deleteChild(relativePath: any): void;
    #private;
}
//# sourceMappingURL=x-model.d.ts.map