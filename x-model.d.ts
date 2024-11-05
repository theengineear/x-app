/**
 * XModel — a simple state management tool.
 * It provides the following:
 *   1. Events.
 *   2. Deep object management.
 *   3. Delegated scope management.
 * ```js
 * import XModel from '@import/x-app/x-model.js';
 * class MyModel extends XModel {
 *   async load() {
 *     // Models are responsible for data fetching.
 *     const response = await new Promise.resolve({ data: 'hot off the press' });
 *     this.set('data', response.data);
 *   }
 * }
 * ```
 */
export class XModel {
    static "__#1@#models": WeakMap<WeakKey, any>;
    static "__#1@#events": WeakMap<WeakKey, any>;
    static "__#1@#paths": Map<any, any>;
    static "__#1@#stacks": Set<any>;
    static "__#1@#isObject"(object: any): boolean;
    static "__#1@#hasKey"(object: any, key: any): boolean;
    static "__#1@#getKey"(object: any, key: any): any;
    static "__#1@#getNext"(key: any): {};
    static "__#1@#pathOrKeyToPath"(path: any): any;
    static "__#1@#pathToKeys"(path: any): any;
    static "__#1@#deprecated"(reason: any): void;
    static "__#1@#invalidate"(model: any): Promise<void>;
    static "__#1@#update"(model: any): void;
    static "__#1@#freeze"(value: any): void;
    static "__#1@#handleEvent"(model: any, event: any): void;
    /**
     * Check if a value exists at some path in object.
     * @param {any} object
     * @param {string|number|(string|number)[]} pathOrKey
     * @returns {boolean}
     */
    static has(object: any, pathOrKey: string | number | (string | number)[]): boolean;
    /**
     * Get a value at some path in object.
     * @param {any} object
     * @param {string|number|(string|number)[]} pathOrKey
     * @returns {any}
     */
    static get(object: any, pathOrKey: string | number | (string | number)[]): any;
    /**
     * Create a copy of the given object with a value set at the given path.
     * @param {any} object
     * @param {string|number|(string|number)[]} pathOrKey
     * @param {any} value
     * @returns {any}
     */
    static set(object: any, pathOrKey: string | number | (string | number)[], value: any): any;
    /**
     * Create a copy of the given object with a value deleted at the given path.
     * @param {any} object
     * @param {string|number|(string|number)[]} pathOrKey
     * @returns {any}
     */
    static delete(object: any, pathOrKey: string | number | (string | number)[]): any;
    /**
     * Deprecated call to register model (when it used to be an HTMLElement).
     * @deprecated
     */
    static register(): void;
    /**
     * @typedef {object} Input
     * @param {any} [value]
     */
    /**
     * Create a new XModel instance, while you can provide a “value” to initialize
     * the model, this is being deprecated and you should prefer to assign a value
     * _after_ instantiation.
     * @param {Input} [input]
     */
    constructor(input?: any);
    /**
     * Get the root model’s store (which may be this model’s own store if root).
     * @deprecated
     * @throws Deprecation error.
     * @returns {void}
     */
    get store(): void;
    /**
     * Return the _string_ path concatenated by a “.” character.
     * @deprecated
     * @returns {null|string}
     */
    get path(): string;
    /**
     * Return the array of keys locating this model in the tree.
     * @returns {string[]}
     */
    get pathNext(): string[];
    /**
     * Return the string which locates this model relative to its parent.
     * @deprecated
     * @returns {null|string}
     */
    get relativePath(): string;
    /**
     * Return the string which locates this model relative to its parent.
     * @returns {null|string}
     */
    get key(): string;
    /**
     * Return a pointer to the model root (there is always a root).
     * @returns {XModel}
     */
    get root(): XModel;
    /**
     * Return a pointer to the model parent (if this is not the root model).
     * @returns {null|XModel}
     */
    get parent(): XModel;
    /**
     * Convenience setter for current value, same as “setValue”.
     * @param {any} value
     * @returns {void}
     */
    set value(value: any);
    /**
     * Convenience getter for current value, same as “getValue”.
     * @returns {any}
     */
    get value(): any;
    /**
     * Strict check for existence (e.g., even “undefined”).
     * @returns {boolean}
     */
    hasValue(): boolean;
    /**
     * Completely unsets store “value” (see {@link hasValue}).
     * @returns {void}
     */
    deleteValue(): void;
    /**
     * Get value for model, same as using {@link XModel#value} getter.
     * @returns {any}
     */
    getValue(): any;
    /**
     * Set value for model, same as using {@link XModel#value} setter.
     * @param {any} [value]
     * @returns {void}
     */
    setValue(value?: any): void;
    /**
     * Strict check for existence at given path (e.g., even “undefined”).
     * @param {undefined|string|number|(string|number)[]} [pathOrKey]
     * @returns {boolean}
     */
    has(pathOrKey?: undefined | string | number | (string | number)[], ...args: any[]): boolean;
    /**
     * Delete value at path (if one exists).
     * @param {string|number|(string|number)[]} [pathOrKey]
     * @returns {void}
     */
    delete(pathOrKey?: string | number | (string | number)[], ...args: any[]): void;
    /**
     * Return value at path (if one exists).
     * @param {string|number|(string|number)[]} [pathOrKey]
     * @returns {any}
     */
    get(pathOrKey?: string | number | (string | number)[], ...args: any[]): any;
    /**
     * Set value at path and create missing branches.
     * @param {string|number|(string|number)[]} pathOrKey
     * @param {any} [value]
     * @returns {void}
     */
    set(pathOrKey: string | number | (string | number)[], value?: any, ...args: any[]): void;
    /**
     * See {@link delete}.
     * @deprecated
     * @param {string|number|(string|number)[]} [pathOrKey]
     * @returns {void}
     */
    remove(pathOrKey?: string | number | (string | number)[], ...args: any[]): void;
    /**
     * Callback for subscribers to model.
     * @callback callback
     * @param {any} oldValue
     * @param {any} newValue
     *
     * @returns {any}
     */
    /**
     * Subscribe to store changes. Latest subscriber wins.
     * @param {callback} callback
     * @throws Throws an error if callback is not a function.
     * @returns {void}
     */
    subscribe(callback: (oldValue: any, newValue: any) => any): void;
    /**
     * Check if this model is the root of the model tree.
     * @returns {boolean}
     */
    isRoot(): boolean;
    /**
     * Resolve full path _string_ for a relative path key.
     * @deprecated
     * @param {string} relativePath
     * @returns {string}
     */
    resolvePath(relativePath: string): string;
    /**
     * Check if a child model is currently mounted at the given relative path key.
     * @param {string} key
     * @returns {boolean}
     */
    hasChild(key: string): boolean;
    /**
     * Get child model mounted at the given relative path key (if one exists).
     * @param {string} key
     * @returns {null|XModel}
     */
    getChild(key: string): null | XModel;
    /**
     * Mount child model at the given relative path key.
     * @deprecated
     * @param {string} key
     * @param {XModel} child
     * @returns {void}
     */
    setChild(key: string, child: XModel): void;
    /**
     * Mount child model at the given relative path key.
     * @param {string} key
     * @param {XModel} child
     * @returns {void}
     */
    attachChild(key: string, child: XModel): void;
    /**
     * Delete child at the given relative path key (if one exists)
     * @deprecated
     * @param key
     * @throws Throws if a relative path is not specified.
     * @returns {void}
     */
    deleteChild(key: any): void;
    /**
     * Detach child at the given relative path key (if one exists)
     * @param key
     * @throws Throws if a relative path is not specified.
     * @returns {void}
     */
    detachChild(key: any): void;
    /**
     * Mount child model into given parent at the given relative path key.
     * @param {string} key
     * @param {XModel} parent
     * @returns {void}
     */
    attach(key: string, parent: XModel): void;
    /**
     * Unmount child model from model tree (i.e., makes it a new root of a tree).
     * @returns {void}
     */
    detach(): void;
    /**
     * Callback for “addEventListener”.
     * @callback listener
     * @param {Event} event
     * @returns {void}
     */
    /**
     * Strict subset of “EventTarget.addEventListener”.
     * @param {string} type
     * @param {listener} callback
     * @throws Throws for invalid arguments / call signature.
     * @returns {void}
     */
    addEventListener(type: string, callback: (event: Event) => void, ...args: any[]): void;
    /**
     * Strict subset of “EventTarget.removeEventListener”.
     * @param {string} type
     * @param {listener} callback
     * @throws Throws for invalid arguments / call signature.
     * @returns {void}
     */
    removeEventListener(type: string, callback: (event: Event) => void, ...args: any[]): void;
    /**
     * Strict subset of “EventTarget.dispatchEvent”.
     * @param {Event} event
     * @throws Throws for invalid configuration.
     * @returns {void}
     */
    dispatchEvent(event: Event): void;
    #private;
}
//# sourceMappingURL=x-model.d.ts.map