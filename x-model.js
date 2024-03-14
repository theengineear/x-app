// Cache all transformations of path, a delimited string, to an array.
const pathToKeysMap = new Map();

// Sentinel to allow set to also delete.
const DELETE = Symbol('__delete__');

// Simple helpers that we don't want as part of our interface.
const isObject = obj => obj instanceof Object && obj !== null;
const hasKey = (obj, key) => (isObject(obj) ? Reflect.has(obj, key) : false);
const getKey = (obj, key) => isObject(obj) ? Reflect.get(obj, key) : undefined;
const getNext = key => (Number.isInteger(key) ? [] : {});

/**
 * Provides helper functions for non-mutating, deep object manipulation.
 */
export class Deep {
  static pathToKeys(path) {
    if (typeof path !== 'string') {
      throw new Error('Path must be a string.');
    }
    if (pathToKeysMap.has(path) === false) {
      const keys = path.split('.').map(key => {
        const intKey = Number.parseInt(key, 10);
        return intKey.toString() === key && intKey >= 0 ? intKey : key;
      });
      this.freeze(keys);
      pathToKeysMap.set(path, keys);
    }
    return pathToKeysMap.get(path);
  }

  static clone(obj, shallow) {
    // TODO: Can be replaced with structuredClone at this point.
    return isObject(obj)
      ? shallow
        ? Object.assign(obj instanceof Array ? [] : {}, obj)
        : JSON.parse(JSON.stringify(obj))
      : obj;
  }

  static freeze(value) {
    if (!Object.isFrozen(value)) {
      Object.freeze(value);
      if (isObject(value)) {
        // Note, we ignore non-enumerable properties (Symbols) here.
        Object.values(value).forEach(this.freeze, this);
      }
    }
  }

  static equal(a, b) {
    if (a === b) {
      return true;
    }
    return (
      isObject(a) &&
      isObject(b) &&
      // Note, we ignore non-enumerable properties (Symbols) here.
      Object.keys(a).length === Object.keys(b).length &&
      Object.keys(a).every(key => this.equal(a[key], b[key]))
    );
  }

  static has(obj, path) {
    const keys = this.pathToKeys(path);
    const lastIndex = keys.length - 1;
    let ref = obj;
    for (let i = 0; i < lastIndex; i++) {
      const key = keys[i];
      if (hasKey(ref, key) === false) {
        return false;
      }
      ref = getKey(ref, key);
    }
    return hasKey(ref, keys[lastIndex]);
  }

  static get(obj, path) {
    const keys = this.pathToKeys(path);
    const lastIndex = keys.length - 1;
    let ref = obj;
    for (let i = 0; i < lastIndex; i++) {
      const key = keys[i];
      if (hasKey(ref, key) === false) {
        return undefined;
      }
      ref = getKey(ref, key);
    }
    return getKey(ref, keys[lastIndex]);
  }

  static set(obj, path, value) {
    const keys = this.pathToKeys(path);
    const lastIndex = keys.length - 1;
    const lastKey = keys[lastIndex];
    const nextValue = isObject(obj) ? this.clone(obj, true) : getNext(keys[0]);
    let ref = nextValue;
    for (let i = 0; i < lastIndex; i++) {
      const key = keys[i];
      let child = getKey(ref, key);
      child = isObject(child) ? this.clone(child, true) : getNext(keys[i + 1]);
      Reflect.set(ref, key, child);
      ref = child;
    }
    if (value === DELETE) {
      if (Reflect.has(ref, lastKey) === false) {
        return obj;
      }
      Reflect.deleteProperty(ref, lastKey);
    } else {
      if (Reflect.has(ref, lastKey) && Reflect.get(ref, lastKey) === value) {
        return obj;
      }
      Reflect.set(ref, keys[lastIndex], value);
    }
    return nextValue;
  }

  static delete(obj, path) {
    return this.set(obj, path, DELETE);
  }
}

/**
 * TODO: Write simple docstring for this.
 */
let count = 0;
export class Store {
  count = count++;
  #value = {};
  #callback = () => {};
  #invalid = false;

  get value() {
    return this.#value.value;
  }

  set value(newValue) {
    Deep.freeze(newValue);
    this.invalidate();
    this.#value.value = newValue;
  }

  hasValue() {
    return Reflect.has(this.#value, 'value');
  }

  removeValue() {
    this.invalidate();
    Reflect.deleteProperty(this.#value, 'value');
  }

  has(path) {
    if (arguments.length === 0) {
      return this.hasValue();
    }
    return this.hasValue() ? Deep.has(this.value, path) : false;
  }

  get(path) {
    if (arguments.length === 0) {
      return this.value;
    }
    return this.hasValue() ? Deep.get(this.value, path) : undefined;
  }

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

  subscribe(callback) {
    if (callback instanceof Function) {
      this.#callback = callback;
      this.#callback(undefined, this.value);
    } else {
      throw new Error('Subscribe callback must be a Function.');
    }
  }

  async invalidate() {
    if (!this.#invalid) {
      const oldValue = this.value;
      this.#invalid = true;
      await Promise.resolve();
      this.#invalid = false;
      this.#callback(oldValue, this.value);
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
export default class XModel extends HTMLElement {
  #store = new Store();

  constructor(input = {}) {
    super(...arguments);
    if (Reflect.has(input, 'value')) {
      this.set(Reflect.get(input, 'value'));
    }
    this.attachShadow({ mode: 'open' });
  }

  get store() {
    return this.isRoot ? this.#store : this.parent.store;
  }

  get value() {
    return this.get();
  }

  get isRoot() {
    // If host === "this", we are the root of an orphaned element tree.
    const host = this.getRootNode().host;
    return !(host instanceof XModel && host !== this);
  }

  get parent() {
    return this.isRoot ? null : this.getRootNode().host;
  }

  get path() {
    return this.isRoot ? undefined : this.parent.resolve(this.relativePath);
  }

  get relativePath() {
    // The “id” is the element id. See “setChild” for context.
    return this.isRoot ? undefined : this.id;
  }

  subscribe(callback) {
    if (this.isRoot) {
      this.store.subscribe(callback);
    } else {
      throw new Error('Subscriptions are not allowed on children.');
    }
  }

  has(relativePath) {
    return this.isRoot
      ? this.store.has(...arguments)
      : arguments.length === 0
        ? this.store.has(this.path)
        : this.store.has(this.resolve(relativePath));
  }

  get(relativePath) {
    return this.isRoot
      ? this.store.get(...arguments)
      : arguments.length === 0
        ? this.store.get(this.path)
        : this.store.get(this.resolve(relativePath));
  }

  set(relativePath, value) {
    return this.isRoot
      ? this.store.set(...arguments)
      : arguments.length === 1
        ? this.store.set(this.path, relativePath)
        : this.store.set(this.resolve(relativePath), value);
  }

  remove(relativePath) {
    return this.isRoot
      ? this.store.remove(...arguments)
      : arguments.length === 0
        ? this.store.remove(this.path)
        : this.store.remove(this.resolve(relativePath));
  }

  resolve(relativePath) {
    return this.isRoot ? relativePath : `${this.path}.${relativePath}`;
  }

  hasChild(relativePath) {
    return !!this.getChild(relativePath);
  }

  getChild(relativePath) {
    return this.shadowRoot.getElementById(relativePath);
  }

  setChild(relativePath, child) {
    // Ensure that we don't accidentally have two children with the same id.
    this.deleteChild(relativePath);
    // Add id first so that child can set on store during connectedCallback.
    child.id = relativePath;
    this.shadowRoot.appendChild(child);
  }

  deleteChild(relativePath) {
    if (relativePath === '') {
      throw new Error('Child models must specify a relativePath.');
    }
    if (this.hasChild(relativePath)) {
      this.shadowRoot.removeChild(this.getChild(relativePath));
    }
  }

  static register() {
    // Note that this will throw if "this" or "tag" are ever registered twice.
    let tag = this.name[0].toLowerCase() + this.name.slice(1);
    tag = tag.replace(/([A-Z])/g, '-$1').toLowerCase();
    tag = !tag.includes('-') ? `${tag}-model` : tag;
    tag = XModel.#dedupe(tag);
    customElements.define(tag, this);
  }

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
