/**
 * Helper to switch between separate HTML tag names and bind properties.
 */
export class XSwitch extends HTMLElement {
  /** @type {boolean} */
  #queued = false;

  /** @type {boolean} */
  #initialized = false;

  /** @type {undefined|string} */
  #tag = undefined;

  /** @type {undefined|object} */
  #properties = undefined;

  /**
   * Set the HTML element tag that should be stamped into the DOM.
   * 
   * @param {any} value
   */
  set tag(value) {
    this.#tag = value;
    if (this.#tag === null || this.#tag === undefined) {
      this.removeAttribute('tag');
    } else {
      this.setAttribute('tag', this.#tag);
    }
    this.#queue();
  }

  /**
   * Get the turn HTML element tag being rendered (if any).
   * 
   * @returns {any}
   */
  get tag() {
    return this.#tag;
  }

  /**
   * Set the properties to bind to the element managed by this switch wrapper.
   * 
   * @param {any} value
   */
  set properties(value) {
    this.#properties = value;
    this.#queue();
  }

  /**
   * Set the properties bound to the element managed by this switch wrapper.
   * 
   * @returns {any}
   */
  get properties() {
    return this.#properties;
  }

  /**
   * Trigger a render to update the DOM
   * 
   * @returns {void}
   */
  render() {
    const { tag, properties, firstElementChild } = this;
    if (tag) {
      if (firstElementChild?.localName === tag) {
        Object.assign(firstElementChild, properties);
      } else {
        firstElementChild?.remove();
        // TODO: Note that this can throw an error when invalid:
        //  Uncaught (in promise) DOMException: Failed to execute 'createElement'
        //  on 'Document': The tag name provided ('not a valid tag name') is not
        //  a valid name.
        this.append(Object.assign(document.createElement(tag), properties));
      }
    } else {
      firstElementChild?.remove();
    }
  }

  static get observedAttributes() {
    return ['tag'];
  }

  connectedCallback() {
    if (!this.#initialized) {
      this.#initialized = true;
      // Prevent shadowing from properties added to element instance pre-upgrade.
      for (const key of Reflect.ownKeys(this)) {
        const value = Reflect.get(this, key);
        Reflect.deleteProperty(this, key);
        Reflect.set(this, key, value);
      }
    }
    this.render();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (this[name] !== newValue) {
      this[name] = newValue;
    }
  }

  async #queue() {
    if (!this.#queued) {
      this.#queued = true;
      await Promise.resolve();
      this.#queued = false;
      this.render();
    }
  }
}

customElements.define('x-switch', XSwitch);
