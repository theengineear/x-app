/**
 * Provides helper functions for non-mutating, deep object manipulation.
 */
export class Deep {
  /** @type {Map<string, string[]>} */
  static #pathToKeysMap = new Map();

  /** @type {symbol} */
  static #DELETE_SENTINEL = Symbol('__delete__');

  /**
   * @param {any} object
   * @returns {boolean}
   */
  static #isObject(object) {
    return object instanceof Object && object !== null;
  }

  /**
   * @param {any} object
   * @param {any} key
   * @returns {boolean}
   */
  static #hasKey(object, key) {
    return Deep.#isObject(object) ? Reflect.has(object, key) : false;
  }

  /**
   * @param {any} object
   * @param {any} key
   * @returns {any}
   */
  static #getKey(object, key) {
    return Deep.#isObject(object) ? Reflect.get(object, key) : undefined;
  }

  /**
   * @param {any} key
   * @returns {[]|{}}
   */
  static #getNext(key) {
    return Number.isInteger(key) ? [] : {};
  }

  /**
   * Split a path DSL into separate keys. 
   * @param {string} path
   * @throws Throws an error if path isn’t a string.
   * @returns {string[]}
   */
  static pathToKeys(path) {
    if (typeof path !== 'string') {
      throw new Error('Path must be a string.');
    }
    if (Deep.#pathToKeysMap.has(path) === false) {
      const keys = path.split('.').map(key => {
        const intKey = Number.parseInt(key, 10);
        return intKey.toString() === key && intKey >= 0 ? intKey : key;
      });
      this.freeze(keys);
      Deep.#pathToKeysMap.set(path, keys);
    }
    return Deep.#pathToKeysMap.get(path);
  }

  /**
   * @overload
   * @param {object} object
   * @param {boolean} [shallow]
   * @returns {object}
   */

  /**
   * Deep (or shallow) clone given object.
   * 
   * @param {any} object
   * @param {boolean} [shallow]
   * @returns {any}
   */
  static clone(object, shallow) {
    return Deep.#isObject(object)
      ? shallow
        ? Object.assign(object instanceof Array ? [] : {}, object)
        : structuredClone(object)
      : object;
  }

  /**
   * Deep-freeze the given value (if freezable).
   * 
   * @param {any} value
   * @returns {void}
   */
  static freeze(value) {
    if (!Object.isFrozen(value)) {
      Object.freeze(value);
      if (Deep.#isObject(value)) {
        // Note, we ignore non-enumerable properties (Symbols) here.
        Object.values(value).forEach(this.freeze, this);
      }
    }
  }

  /**
   * Deep-equality check for any two arguments (versus check-by-reference).
   * 
   * @param {any} a
   * @param {any} b
   * @returns {boolean}
   */
  static equal(a, b) {
    if (a === b) {
      return true;
    }
    return (
      Deep.#isObject(a) &&
      Deep.#isObject(b) &&
      // Note, we ignore non-enumerable properties (Symbols) here.
      Object.keys(a).length === Object.keys(b).length &&
      Object.keys(a).every(key => this.equal(a[key], b[key]))
    );
  }

  /**
   * Check if a value _exists_ at the given path.
   * 
   * @param {any} object
   * @param {string} path
   * @returns {boolean}
   */
  static has(object, path) {
    const keys = this.pathToKeys(path);
    const lastIndex = keys.length - 1;
    let reference = object;
    for (let i = 0; i < lastIndex; i++) {
      const key = keys[i];
      if (Deep.#hasKey(reference, key) === false) {
        return false;
      }
      reference = Deep.#getKey(reference, key);
    }
    return Deep.#hasKey(reference, keys[lastIndex]);
  }

  /**
   * Get value at the given path.
   * 
   * @param {any} object
   * @param {string} path
   * @returns {any}
   */
  static get(object, path) {
    const keys = this.pathToKeys(path);
    const lastIndex = keys.length - 1;
    let reference = object;
    for (let i = 0; i < lastIndex; i++) {
      const key = keys[i];
      if (Deep.#hasKey(reference, key) === false) {
        return undefined;
      }
      reference = Deep.#getKey(reference, key);
    }
    return Deep.#getKey(reference, keys[lastIndex]);
  }

  /**
   * @overload
   * @param {object} object
   * @param {string} path
   * @param {any} value
   * @returns {object}
   */

  /**
   * Get new object with value set at deeply nested path and fill in any missing
   * branches.
   * 
   * @param {any} object
   * @param {string} path
   * @param {any} value
   * @returns {any}
   */
  static set(object, path, value) {
    const keys = this.pathToKeys(path);
    const lastIndex = keys.length - 1;
    const lastKey = keys[lastIndex];
    const nextValue = Deep.#isObject(object) ? this.clone(object, true) : Deep.#getNext(keys[0]);
    let reference = nextValue;
    for (let i = 0; i < lastIndex; i++) {
      const key = keys[i];
      let child = Deep.#getKey(reference, key);
      child = Deep.#isObject(child) ? this.clone(child, true) : Deep.#getNext(keys[i + 1]);
      Reflect.set(reference, key, child);
      reference = child;
    }
    if (value === Deep.#DELETE_SENTINEL) {
      if (Reflect.has(reference, lastKey) === false) {
        return object;
      }
      Reflect.deleteProperty(reference, lastKey);
    } else {
      if (Reflect.has(reference, lastKey) && Reflect.get(reference, lastKey) === value) {
        return object;
      }
      Reflect.set(reference, keys[lastIndex], value);
    }
    return nextValue;
  }

  /**
   * @overload
   * @param {object} object
   * @param {string} path
   * @returns {object}
   */

  /**
   * Get new object with value deleted at deeply nested path and fill in any
   * missing branches.
   * 
   * @param {any} object
   * @param {string} path
   * @returns {any}
   */
  static delete(object, path) {
    return this.set(object, path, Deep.#DELETE_SENTINEL);
  }
}

/**
 * A simple state store which model trees use to house application state.
 */
export class Store {
  /** @type {object} */
  #value = {};

  /**
   * @callback Store~subscribeCallback
   * @param {any} oldValue
   * @param {any} newValue
   *
   * @returns {any}
   */

  /** @type {Store~subscribeCallback} */
  #subscribeCallback = (oldValue, newValue) => {}; // eslint-disable-line no-unused-vars

  /** @type {boolean} */
  #invalid = false;

  /**
   * Returns the value of the store — typically a plain javascript object.
   * 
   * @returns {any}
   */
  get value() {
    return this.#value.value;
  }

  /**
   * Updates the value of the store and deep-freezes result to prevent
   * tampering. Finally, it also queues up a notification to subscribers.
   * 
   * @param {any} [newValue]
   */
  set value(newValue) {
    Deep.freeze(newValue);
    this.invalidate();
    this.#value.value = newValue;
  }

  /**
   * Strict check for existence (e.g., even “undefined”).
   * 
   * @returns {boolean}
   */
  hasValue() {
    return Reflect.has(this.#value, 'value');
  }

  /**
   * Completely unsets store “value” (see {@link hasValue}).
   * 
   * @returns {void}
   */
  removeValue() {
    this.invalidate();
    Reflect.deleteProperty(this.#value, 'value');
  }

  /**
   * @overload
   * @returns {boolean}
   */

  /**
   * Strict check for existence at given path (e.g., even “undefined”).
   * 
   * @param {string} [path]
   * @returns {boolean}
   */
  has(path) {
    if (arguments.length === 0) {
      return this.hasValue();
    }
    return this.hasValue() ? Deep.has(this.value, path) : false;
  }

  /**
   * @overload
   * @returns {any}
   */

  /**
   * Return value at path (if one exists).
   * 
   * @param {string} [path]
   * @returns {any}
   */
  get(path) {
    if (arguments.length === 0) {
      return this.value;
    }
    return this.hasValue() ? Deep.get(this.value, path) : undefined;
  }

  /**
   * @overload
   * @param {any} path
   * @returns {void}
   */

  /**
   * @overload
   * @param {string} path
   * @param {any} value
   * @returns {void}
   */

  /**
   * Return value at path (if one exists).
   * 
   * @param {any|string} path
   * @param {any} [value]
   * @returns {void}
   */
  set(path, value) {
    if (arguments.length === 1) {
      this.value = path;
    } else {
      if (this.hasValue() === false) {
        this.value = Number.isInteger(Deep.pathToKeys(path)[0]) ? [] : {};
      }
      this.value = Deep.set(this.value, path, value);
    }
  }

  /**
   * @overload
   * @returns {void}
   */

  /**
   * Return value at path (if one exists).
   * 
   * @param {string} [path]
   * @returns {void}
   */
  remove(path) {
    if (arguments.length === 0) {
      this.removeValue();
    } else {
      if (this.hasValue() === false) {
        this.value = Number.isInteger(Deep.pathToKeys(path)[0]) ? [] : {};
      }
      this.value = Deep.delete(this.value, path);
    }
  }

  /**
   * Subscribe to store changes. Latest subscriber wins.
   * 
   * @param {Store~subscribeCallback} callback
   * @throws Throws an error if callback is not a function.
   * @returns {void}
   */
  subscribe(callback) {
    if (callback instanceof Function) {
      this.#subscribeCallback = callback;
      this.#subscribeCallback(undefined, this.value);
    } else {
      throw new Error('Subscribe callback must be a Function.');
    }
  }

  /**
   * Mark the store as invalid, queuing a future callback to subscribers.
   * 
   * @returns {Promise<void>}
   */
  async invalidate() {
    if (!this.#invalid) {
      const oldValue = this.value;
      this.#invalid = true;
      await Promise.resolve();
      this.#invalid = false;
      this.#subscribeCallback(oldValue, this.value);
    }
  }
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
  /** @type {Store} */
  #store = new Store();

  /**
   * Initial value can be passed as input.
   * 
   * @param {object} [input]
   * @returns {void}
   */
  constructor(input) {
    super();
    input = input ?? {};
    if (Reflect.has(input, 'value')) {
      this.set(Reflect.get(input, 'value'));
    }
    this.attachShadow({ mode: 'open' });
  }

  /**
   * Get the root model’s store (which may be this model’s own store if root).
   * 
   * @returns {Store}
   */
  get store() {
    return this.isRoot ? this.#store : this.parent.store;
  }

  /**
   * Get the value in the store which is managed by this model.
   * 
   * @returns {any}
   */
  get value() {
    return this.get();
  }

  /**
   * Simple check to determine if this model is the root of the model tree.
   * 
   * @returns {boolean}
   */
  get isRoot() {
    // If host === "this", we are the root of an orphaned element tree.
    const host = this.getRootNode().host;
    return !(host instanceof XModel && host !== this);
  }

  /**
   * Get the parent model object (if one exists).
   * 
   * @returns {null|XModel}
   */
  get parent() {
    return this.isRoot ? null : this.getRootNode().host;
  }

  /**
   * Get the full path to this model from the root.
   * 
   * @returns {undefined|string}
   */
  get path() {
    return this.isRoot ? undefined : this.parent.resolve(this.relativePath);
  }

  /**
   * Get the partial path that this model is mounted at relative to its parent.
   * See {@link setChild} for context.
   * 
   * @returns {undefined|string}
   */
  get relativePath() {
    // The “id” is the element id. See “setChild” for context.
    return this.isRoot ? undefined : this.id;
  }

  /**
   * Subscribe to store — only allowed on the root model.
   * 
   * @param {Store~subscribeCallback} callback
   * @throws Throws an error if the target model is not the root model.
   * @returns {void}
   */
  subscribe(callback) {
    if (this.isRoot) {
      this.store.subscribe(callback);
    } else {
      throw new Error('Subscriptions are not allowed on children.');
    }
  }

  /**
   * @overload
   * @returns {boolean}
   */

  /**
   * Checks if a path exists and accounts for nested model tree relativity.
   * 
   * @param {string} [relativePath]
   * @returns {boolean}
   */
  has(relativePath) {
    return this.isRoot
      ? arguments.length === 0
        ? this.store.has()
        : this.store.has(relativePath)
      : arguments.length === 0
        ? this.store.has(this.path)
        : this.store.has(this.resolve(relativePath));
  }

  /**
   * @overload
   * @returns {any}
   */

  /**
   * Gets value at path and accounts for nested model tree relativity.
   * 
   * @param {string} [relativePath]
   * @returns {any}
   */
  get(relativePath) {
    return this.isRoot
      ? arguments.length === 0
        ? this.store.get()
        : this.store.get(relativePath)
      : arguments.length === 0
        ? this.store.get(this.path)
        : this.store.get(this.resolve(relativePath));
  }

  /**
   * @overload
   * @param {any} relativePath
   * @returns {void}
   */

  /**
   * @overload
   * @param {string} relativePath
   * @param {any} value
   * @returns {void}
   */

  /**
   * Return value at path (if one exists).
   * 
   * @param {any|string} relativePath
   * @param {any} [value]
   * @returns {void}
   */
  set(relativePath, value) {
    this.isRoot
      ? arguments.length === 1
        ? this.store.set(relativePath)
        : this.store.set(relativePath, value)
      : arguments.length === 1
        ? this.store.set(this.path, relativePath)
        : this.store.set(this.resolve(relativePath), value);
  }

  /**
   * @overload
   * @returns {void}
   */

  /**
   * Removes value at path and accounts for nested model tree relativity.
   *
   * @param {string} [relativePath]
   * @returns {void}
   * 
   * Note, the end-comment tag has to be on the same line to ignore this.
   * TypeScript raises an error here because “remove” has a different call
   * signature from the parent HTMLElement class.
   * @ts-ignore */
  remove(relativePath) {
    this.isRoot
      ? arguments.length === 0
        ? this.store.remove()
        : this.store.remove(relativePath)
      : arguments.length === 0
        ? this.store.remove(this.path)
        : this.store.remove(this.resolve(relativePath));
  }

  /**
   * Get the full path from the root of the model tree.
   * 
   * @param {string} relativePath
   * @returns {string}
   */
  resolve(relativePath) {
    return this.isRoot ? relativePath : `${this.path}.${relativePath}`;
  }

  /**
   * Check if a child model is currently mounted at the given relative path.
   * 
   * @param {string} relativePath
   * @returns {boolean}
   */
  hasChild(relativePath) {
    return !!this.getChild(relativePath);
  }

  /**
   * Get child model mounted at the given relative path (if one exists).
   * 
   * @param {string} relativePath
   * @returns {null|XModel}
   */
  getChild(relativePath) {
    return this.shadowRoot.getElementById(relativePath);
  }

  /**
   * Mount child model at the given relative path.
   * 
   * @param {string} relativePath
   * @param {XModel} child
   * @returns {void}
   */
  setChild(relativePath, child) {
    // Ensure that we don't accidentally have two children with the same id.
    this.deleteChild(relativePath);
    // Add id first so that child can set on store during connectedCallback.
    child.id = relativePath;
    this.shadowRoot.append(child);
  }

  /**
   * Delete child at the given relative path (if one exists)
   * 
   * @param relativePath
   * @throws Throws if a relative path is not specified.
   * @returns {void}
   */
  deleteChild(relativePath) {
    if (!relativePath) {
      throw new Error('Child models must specify a relativePath.');
    }
    if (this.hasChild(relativePath)) {
      this.shadowRoot.removeChild(this.getChild(relativePath));
    }
  }

  /**
   * Because XModel leverages HTMLElement’s and shadow roots, we must define a
   * new tag in the custom element registry. Note that names are de-duped such
   * that XModel class names can be repeated (if necessary).
   * 
   * @returns {void}
   */
  static register() {
    // Note that this will throw if "this" or "tag" are ever registered twice.
    let tag = this.name[0].toLowerCase() + this.name.slice(1);
    tag = tag.replace(/([A-Z])/g, '-$1').toLowerCase();
    tag = !tag.includes('-') ? `${tag}-model` : tag;
    tag = XModel.#dedupe(tag);
    customElements.define(tag, this);
  }

  /**
   * Simple helper to de-dupe registered tag names.
   * 
   * @param {string} candidate
   * @returns {string}
   */
  static #dedupe(candidate) {
    // Either class name duplication or minification can create a duplicate tag
    //  name. This is a fail-safe to prevent that. It preserves the original
    //  candidate name as a prefix and ensures the entire tag name has not yet
    //  been registered.
    const original = candidate;
    const letters = 'abcdefghijklmnopqrstuvwxyz';
    while (customElements.get(candidate)) {
      let suffix = '';
      for (let iii = 0; iii < 10; iii++) {
        suffix += letters[Math.floor(Math.random() * letters.length)];
      }
      candidate = `${original}-${suffix}`;
    }
    return candidate;
  }
}

// Models are elements and need to be registered to use.
XModel.register();
