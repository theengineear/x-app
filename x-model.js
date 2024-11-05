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
  static #models = new WeakMap();
  static #events = new WeakMap();
  static #paths = new Map();
  static #stacks = new Set();
  #state = {};

  static #isObject(object) {
    return object instanceof Object;
  }

  static #hasKey(object, key) {
    return XModel.#isObject(object) ? Reflect.has(object, key) : false;
  }

  static #getKey(object, key) {
    return XModel.#isObject(object) ? Reflect.get(object, key) : undefined;
  }

  static #getNext(key) {
    return Number.isInteger(key) ? [] : {};
  }

  static #pathOrKeyToPath(path) {
    path = typeof path === 'number' ? [path] : path;
    path = typeof path === 'string' && !path.includes('.') ? [path] : path;
    path = typeof path === 'string' ? XModel.#pathToKeys(path) : path;
    return path;
  }

  static #pathToKeys(path) {
    XModel.#deprecated('String-type path is deprecated. Use an array.');
    if (XModel.#paths.has(path) === false) {
      const keys = path.split('.').map(key => {
        const intKey = Number.parseInt(key, 10);
        return intKey.toString() === key && intKey >= 0 ? intKey : key;
      });
      XModel.#freeze(keys);
      XModel.#paths.set(path, keys);
    }
    return XModel.#paths.get(path);
  }

  static #deprecated(reason) {
    const error = new Error(reason);
    const stack = error.stack;
    if (!this.#stacks.has(stack)) {
      this.#stacks.add(stack);
      setTimeout(() => { console.warn(error); }, 0); // eslint-disable-line no-console
    }
  }

  static async #invalidate(model) {
    const state = XModel.#models.get(model);
    if (state.parent) {
      XModel.#invalidate(state.root);
    } else {
      if (!state.invalid) {
        const oldValue = model.getValue();
        state.invalid = true;
        await Promise.resolve();
        state.invalid = false;
        state.callback?.(oldValue, model.getValue());
      }
    }
  }

  static #update(model) {
    const state = XModel.#models.get(model);
    if (state.parent) {
      const parentState = XModel.#models.get(state.parent);
      state.root = parentState.root;
      state.store = parentState.store;
      state.path = [...parentState.path, state.key];
      for (const child of state.children.values()) {
        XModel.#update(child);
      }
    } else if (state.root !== this) {
      state.root = this;
      state.store = {};
      state.path = [];
      for (const child of state.children.values()) {
        XModel.#update(child);
      }
    }
  }

  static #freeze(value) {
    if (!Object.isFrozen(value)) {
      Object.freeze(value);
      if (XModel.#isObject(value)) {
        // Note, we ignore non-enumerable properties (Symbols) here.
        Object.values(value).forEach(XModel.#freeze, this);
      }
    }
  }

  static #handleEvent(model, event) {
    const modelState = XModel.#models.get(model);
    const eventState = XModel.#events.get(event);
    eventState.currentTarget = model;
    const type = event.type;
    for (const callback of modelState.listeners.get(type) ?? new Set()) {
      if (!eventState.stopImmediatePropagation) {
        // TODO: Validate that “false” or some such is not returned. We don’t
        //  want to try and support that…
        callback.apply(model, [event]);
      }
    }
    if (!eventState.stopPropagation && event.bubbles && event.composed && modelState.parent) {
      XModel.#handleEvent(modelState.parent, event);
    }
  }

  /**
   * Check if a value exists at some path in object.
   * @param {any} object
   * @param {string|number|(string|number)[]} pathOrKey
   * @returns {boolean}
   */
  static has(object, pathOrKey) {
    const path = XModel.#pathOrKeyToPath(pathOrKey);
    const lastIndex = path.length - 1;
    let reference = object;
    for (let i = 0; i < lastIndex; i++) {
      const key = path[i];
      if (XModel.#hasKey(reference, key) === false) {
        return false;
      }
      reference = XModel.#getKey(reference, key);
    }
    return XModel.#hasKey(reference, path[lastIndex]);
  }

  /**
   * Get a value at some path in object.
   * @param {any} object
   * @param {string|number|(string|number)[]} pathOrKey
   * @returns {any}
   */
  static get(object, pathOrKey) {
    const path = XModel.#pathOrKeyToPath(pathOrKey);
    const lastIndex = path.length - 1;
    let reference = object;
    for (let i = 0; i < lastIndex; i++) {
      const key = path[i];
      if (!XModel.#hasKey(reference, key)) {
        return undefined;
      }
      reference = XModel.#getKey(reference, key);
    }
    return XModel.#getKey(reference, path[lastIndex]);
  }

  /**
   * Create a copy of the given object with a value set at the given path.
   * @param {any} object
   * @param {string|number|(string|number)[]} pathOrKey
   * @param {any} value
   * @returns {any}
   */
  static set(object, pathOrKey, value) {
    const path = XModel.#pathOrKeyToPath(pathOrKey);
    const lastIndex = path.length - 1;
    const lastKey = path[lastIndex];
    const nextValue = XModel.#isObject(object)
      ? Object.assign(object instanceof Array ? [] : {}, object)
      : XModel.#getNext(path[0]);
    let reference = nextValue;
    for (let i = 0; i < lastIndex; i++) {
      const key = path[i];
      let child = XModel.#getKey(reference, key);
      child = XModel.#isObject(child)
        ? Object.assign(child instanceof Array ? [] : {}, child)
        : XModel.#getNext(path[i + 1]);
      Reflect.set(reference, key, child);
      reference = child;
    }
    if (Reflect.has(reference, lastKey) && Reflect.get(reference, lastKey) === value) {
      return object;
    } else {
      Reflect.set(reference, path[lastIndex], value);
      return nextValue;
    }
  }

  /**
   * Create a copy of the given object with a value deleted at the given path.
   * @param {any} object
   * @param {string|number|(string|number)[]} pathOrKey
   * @returns {any}
   */
  static delete(object, pathOrKey) {
    const path = XModel.#pathOrKeyToPath(pathOrKey);
    const lastIndex = path.length - 1;
    const lastKey = path[lastIndex];
    const nextValue = XModel.#isObject(object)
      ? Object.assign(object instanceof Array ? [] : {}, object)
      : XModel.#getNext(path[0]);
    let reference = nextValue;
    for (let i = 0; i < lastIndex; i++) {
      const key = path[i];
      let child = XModel.#getKey(reference, key);
      child = XModel.#isObject(child)
        ? Object.assign(child instanceof Array ? [] : {}, child)
        : XModel.#getNext(path[i + 1]);
      Reflect.set(reference, key, child);
      reference = child;
    }
    if (Reflect.has(reference, lastKey) === false) {
      return object;
    } else {
      Reflect.deleteProperty(reference, lastKey);
      return nextValue;
    }
  }

  /**
   * Deprecated call to register model (when it used to be an HTMLElement).
   * @deprecated
   */
  static register() {
    XModel.#deprecated('The "register" method is no longer needed. You may safely delete this call.');
  }

  #invalidateIfChanged(a, b) {
    if (a !== b) {
      XModel.#invalidate(this);
    }
  }

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
  constructor(input) {
    Object.assign(this.#state, {
      root: this,
      store: {},
      path: [],
      listeners: new Map(),
      parent: null,
      children: new Map(),
      key: null,
      invalid: false,
      callback: null,
    });
    XModel.#models.set(this, this.#state);
    input = input ?? {};
    if (Reflect.has(input, 'value')) {
      XModel.#deprecated('Initializing value on construction is deprecated. Set value after construction.');
      this.setValue(Reflect.get(input, 'value'));
    }
  }

  /**
   * Get the root model’s store (which may be this model’s own store if root).
   * @deprecated
   * @throws Deprecation error.
   * @returns {void}
   */
  get store() {
    throw new Error('Access to store has been removed. Use ".value" to get value.');
  }

  /**
   * Return the _string_ path concatenated by a “.” character.
   * @deprecated
   * @returns {null|string}
   */
  get path() {
    XModel.#deprecated('Will return an array in the future. Use ".pathNext".');
    return this.#state.path.join('.') || null;
  }

  /**
   * Return the array of keys locating this model in the tree.
   * @returns {string[]}
   */
  get pathNext() {
    return this.#state.path;
  }

  /**
   * Return the string which locates this model relative to its parent.
   * @deprecated
   * @returns {null|string}
   */
  get relativePath() {
    XModel.#deprecated('Use ".key" instead of ".relativePath".');
    return this.#state.key;
  }

  /**
   * Return the string which locates this model relative to its parent.
   * @returns {null|string}
   */
  get key() {
    return this.#state.key;
  }

  /**
   * Return a pointer to the model root (there is always a root).
   * @returns {XModel}
   */
  get root() {
    return this.#state.root;
  }

  /**
   * Return a pointer to the model parent (if this is not the root model).
   * @returns {null|XModel}
   */
  get parent() {
    return this.#state.parent;
  }

  /**
   * Convenience getter for current value, same as “getValue”.
   * @returns {any}
   */
  get value() {
    return this.getValue();
  }

  /**
   * Convenience setter for current value, same as “setValue”.
   * @param {any} value
   * @returns {void}
   */
  set value(value) {
    this.setValue(value);
  }

  /**
   * Strict check for existence (e.g., even “undefined”).
   * @returns {boolean}
   */
  hasValue() {
    if (this.#state.parent) {
      return XModel.has(this.#state.store, ['value', ...this.#state.path]);
    } else {
      return XModel.has(this.#state.store, ['value']);
    }
  }

  /**
   * Completely unsets store “value” (see {@link hasValue}).
   * @returns {void}
   */
  deleteValue() {
    if (this.#state.parent) {
      const rootValue = XModel.delete(this.#state.store.value, this.#state.path);
      this.#invalidateIfChanged(this.#state.store.value, rootValue);
      XModel.#freeze(rootValue);
      this.#state.store.value = rootValue;
    } else {
      const value = undefined;
      this.#invalidateIfChanged(this.#state.store.value, value);
      Reflect.deleteProperty(this.#state.store, 'value');
    }
  }

  /**
   * Get value for model, same as using {@link XModel#value} getter.
   * @returns {any}
   */
  getValue() {
    if (this.#state.parent) {
      return XModel.get(this.#state.store.value, this.#state.path);
    } else {
      return this.#state.store.value;
    }
  }

  /**
   * Set value for model, same as using {@link XModel#value} setter.
   * @param {any} [value]
   * @returns {void}
   */
  setValue(value) {
    if (this.#state.parent) {
      const rootValue = XModel.set(this.#state.store.value, this.#state.path, value);
      this.#invalidateIfChanged(this.#state.store.value, rootValue);
      XModel.#freeze(rootValue);
      this.#state.store.value = rootValue;
    } else {
      this.#invalidateIfChanged(this.#state.store.value, value);
      XModel.#freeze(value);
      this.#state.store.value = value;
    }
  }

  /**
   * Strict check for existence at given path (e.g., even “undefined”).
   * @param {undefined|string|number|(string|number)[]} [pathOrKey]
   * @returns {boolean}
   */
  has(pathOrKey) {
    if (arguments.length === 0) {
      XModel.#deprecated('Use "hasValue" to check for top-level value existence.');
      return this.hasValue();
    } else {
      const path = XModel.#pathOrKeyToPath(pathOrKey);
      if (this.#state.parent) {
        return XModel.has(this.#state.store.value, [this.#state.path, ...path]);
      } else {
        return XModel.has(this.#state.store.value, path);
      }
    }
  }

  /**
   * Delete value at path (if one exists).
   * @param {string|number|(string|number)[]} [pathOrKey]
   * @returns {void}
   */
  delete(pathOrKey) {
    if (arguments.length === 0) {
      XModel.#deprecated('Use "deleteValue" to delete top-level value.');
      this.deleteValue();
    } else {
      const path = XModel.#pathOrKeyToPath(pathOrKey);
      if (this.#state.parent) {
        const rootValue = XModel.delete(this.#state.store.value, [this.#state.path, ...path]);
        this.#invalidateIfChanged(this.#state.store.value, rootValue);
        XModel.#freeze(rootValue);
        this.#state.store.value = rootValue;
      } else {
        const rootValue = XModel.delete(this.#state.store.value, path);
        this.#invalidateIfChanged(this.#state.store.value, rootValue);
        XModel.#freeze(rootValue);
        this.#state.store.value = rootValue;
      }
    }
  }

  /**
   * Return value at path (if one exists).
   * @param {string|number|(string|number)[]} [pathOrKey]
   * @returns {any}
   */
  get(pathOrKey) {
    if (arguments.length === 0) {
      XModel.#deprecated('Use "getValue" or ".value" to get top-level value.');
      return this.getValue();
    } else {
      const path = XModel.#pathOrKeyToPath(pathOrKey);
      if (this.#state.parent) {
        return XModel.get(this.#state.store.value, [this.#state.path, ...path]);
      } else {
        return XModel.get(this.#state.store.value, path);
      }
    }
  }

  /**
   * Set value at path and create missing branches.
   * @param {string|number|(string|number)[]} pathOrKey
   * @param {any} [value]
   * @returns {void}
   */
  set(pathOrKey, value) {
    if (arguments.length === 1) {
      XModel.#deprecated('Use "setValue" or ".value" to set top-level value.');
      this.setValue(arguments[0]);
    } else {
      const path = XModel.#pathOrKeyToPath(pathOrKey);
      if (this.#state.parent) {
        const rootValue = XModel.set(this.#state.store.value, [this.#state.path, ...path], value);
        this.#invalidateIfChanged(this.#state.store.value, rootValue);
        XModel.#freeze(rootValue);
        this.#state.store.value = rootValue;
      } else {
        const rootValue = XModel.set(this.#state.store.value, path, value);
        this.#invalidateIfChanged(this.#state.store.value, rootValue);
        XModel.#freeze(rootValue);
        this.#state.store.value = rootValue;
      }
    }
  }

  /**
   * See {@link delete}.
   * @deprecated
   * @param {string|number|(string|number)[]} [pathOrKey]
   * @returns {void}
   */
  remove(pathOrKey) {
    XModel.#deprecated('Use "delete" or "deleteValue" (versus "remove").');
    if (arguments.length === 0) {
      this.deleteValue();
    } else {
      this.delete(pathOrKey);
    }
  }

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
  subscribe(callback) {
    if (callback instanceof Function) {
      this.#state.callback = callback;
      this.#state.callback(undefined, this.getValue());
    } else {
      throw new Error('Subscribe callback must be a Function.');
    }
  }

  /**
   * Check if this model is the root of the model tree.
   * @returns {boolean}
   */
  isRoot() {
    return this === this.#state.root;
  }

  /**
   * Resolve full path _string_ for a relative path key.
   * @deprecated
   * @param {string} relativePath
   * @returns {string}
   */
  resolvePath(relativePath) {
    return this.isRoot() ? relativePath : `${this.path}.${relativePath}`;
  }

  /**
   * Check if a child model is currently mounted at the given relative path key.
   * @param {string} key
   * @returns {boolean}
   */
  hasChild(key) {
    if (typeof key !== 'string') {
      throw new Error('Child keys must be strings.');
    }
    return this.#state.children.has(key);
  }

  /**
   * Get child model mounted at the given relative path key (if one exists).
   * @param {string} key
   * @returns {null|XModel}
   */
  getChild(key) {
    if (typeof key !== 'string') {
      throw new Error('Child keys must be strings.');
    }
    return this.#state.children.get(key) ?? null; // Returns null for backwards compat.
  }

  /**
   * Mount child model at the given relative path key.
   * @deprecated
   * @param {string} key
   * @param {XModel} child
   * @returns {void}
   */
  setChild(key, child) {
    XModel.#deprecated('The "setChild" method is deprecated. Use "attachChild".');
    this.attachChild(key, child);
  }

  /**
   * Mount child model at the given relative path key.
   * @param {string} key
   * @param {XModel} child
   * @returns {void}
   */
  attachChild(key, child) {
    if (typeof key !== 'string') {
      throw new Error('Child keys must be strings.');
    }
    if (!(child instanceof XModel)) {
      throw new Error('Child must inherit from "XModel".');
    }
    if (this.#state.children.get(key) !== child) {
      this.detachChild(key);
      child.parent?.detachChild(child.key);
      this.#state.children.set(key, child);
      const childState = XModel.#models.get(child);
      childState.parent = this;
      childState.key = key;
      childState.callback = null;
      XModel.#update(child);
    }
  }

  /**
   * Delete child at the given relative path key (if one exists)
   * @deprecated
   * @param key
   * @throws Throws if a relative path is not specified.
   * @returns {void}
   */
  deleteChild(key) {
    XModel.#deprecated('The "deleteChild" method is deprecated. Use "detachChild".');
    this.detachChild(key);
  }

  /**
   * Detach child at the given relative path key (if one exists)
   * @param key
   * @throws Throws if a relative path is not specified.
   * @returns {void}
   */
  detachChild(key) {
    if (typeof key !== 'string') {
      throw new Error('Child keys must be strings.');
    }
    const child = this.#state.children.get(key);
    if (child) {
      this.#state.children.delete(key);
      const childState = XModel.#models.get(child);
      childState.parent = null;
      childState.key = null;
      XModel.#update(child);
    }
  }

  /**
   * Mount child model into given parent at the given relative path key.
   * @param {string} key
   * @param {XModel} parent
   * @returns {void}
   */
  attach(key, parent) {
    if (typeof key !== 'string') {
      throw new Error('Child keys must be strings.');
    }
    if (!(parent instanceof XModel)) {
      throw new Error('Parent must inherit from "XModel".');
    }
    parent.attachChild(key, this);
  }

  /**
   * Unmount child model from model tree (i.e., makes it a new root of a tree).
   * @returns {void}
   */
  detach() {
    this.parent?.detachChild(this.key);
  }

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
  addEventListener(type, callback/*, options*/) {
    if (typeof type !== 'string') {
      throw new Error('Expected "type" argument to be a "string".');
    }
    if (typeof callback !== 'function') {
      throw new Error('Expected "callback" argument to be a "function".');
    }
    if (arguments.length > 2) {
      throw new Error('Expected exactly two arguments.');
    }
    if (!this.#state.listeners.get(type)) {
      this.#state.listeners.set(type, new Set());
    }
    this.#state.listeners.get(type).add(callback);
  }

  /**
   * Strict subset of “EventTarget.removeEventListener”.
   * @param {string} type
   * @param {listener} callback
   * @throws Throws for invalid arguments / call signature.
   * @returns {void}
   */
  removeEventListener(type, callback/*, options*/) {
    if (typeof type !== 'string') {
      throw new Error('Expected "type" argument to be a "string".');
    }
    if (typeof callback !== 'function') {
      throw new Error('Expected "callback" argument to be a "function".');
    }
    if (arguments.length > 2) {
      throw new Error('Expected exactly two arguments.');
    }
    this.#state.listeners.get(type)?.delete(callback);
  }

  /**
   * Strict subset of “EventTarget.dispatchEvent”.
   * @param {Event} event
   * @throws Throws for invalid configuration.
   * @returns {void}
   */
  dispatchEvent(event) {
    // TODO: Assert always bubbles: true / composed: true. Assert many things…
    //  E.g., don’t support capture or anything like that…
    const composedPath = () => {
      // TODO: We could walk the tree to determine this information.
      throw new Error('The composedPath method is not yet supported.');
    };
    const proxy = new Proxy(event, {
      get(target, property) {
        const eventState = XModel.#events.get(proxy);
        switch (property) {
          case 'stopPropagation':
            eventState.stopPropagation = true;
            return target.stopPropagation.bind(event);
          case 'stopImmediatePropagation':
            eventState.stopPropagation = true;
            eventState.stopImmediatePropagation = true;
            return target.stopImmediatePropagation.bind(event);
          case 'composedPath':
            return composedPath;
          case 'target':
            return eventState.target;
          case 'currentTarget':
            return eventState.currentTarget;
          default:
            return target[property];
        }
      },
    });
    const eventState = { target: this, stopPropagation: false, stopImmediatePropagation: false };
    XModel.#events.set(proxy, eventState);
    XModel.#handleEvent(this, proxy);
  }
}
