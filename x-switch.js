/**
 * TODO: Add short doc string.
 */
export default class XSwitch extends HTMLElement {
  #queued = false;
  #initialized = false;
  #tag = undefined;
  #properties = undefined;

  static get observedAttributes() {
    return ['tag'];
  }

  set tag(value) {
    this.#tag = value;
    if (this.#tag === null || this.#tag === undefined) {
      this.removeAttribute('tag');
    } else {
      this.setAttribute('tag', this.#tag);
    }
    this.#queue();
  }

  get tag() {
    return this.#tag;
  }

  set properties(value) {
    this.#properties = value;
    this.#queue();
  }

  get properties() {
    return this.#properties;
  }

  render() {
    const { tag, properties, firstElementChild } = this;
    if (tag) {
      if (firstElementChild?.localName === tag) {
        Object.assign(firstElementChild, properties);
      } else {
        firstElementChild?.remove();
        this.append(Object.assign(document.createElement(tag), properties));
      }
    } else {
      firstElementChild?.remove();
    }
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
