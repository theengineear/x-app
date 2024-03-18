import '../../x-style.js';
import styleSheet from './swatch.css' with { type: 'css' };

const template = document.createElement('template');
template.innerHTML = `\
<div id="info">
  <div id="label"></div>
</div>
`;

export class Swatch extends HTMLElement {
  #queued = false;
  #label = null;
  #spec = null;
  #dark = false;

  static get observedAttributes() {
    return ['label', 'spec', 'dark'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.adoptedStyleSheets = [styleSheet];
    this.shadowRoot.append(template.content.cloneNode(true));
  }

  set label(value) {
    this.#label = value;
    this.#queue();
  }

  get label() {
    return this.#label;
  }

  set spec(value) {
    this.#spec = value;
    this.#queue();
  }

  get spec() {
    return this.#spec;
  }

  set dark(value) {
    this.#dark = value;
    if (!this.#dark) {
      this.removeAttribute('dark');
    } else {
      this.setAttribute('dark', '');
    }
    this.#queue();
  }

  get dark() {
    return this.#dark;
  }

  render() {
    const { label } = this;
    this.shadowRoot.getElementById('label').textContent = label ?? '';
  }

  connectedCallback() {
    this.render();
    const style = document.defaultView.getComputedStyle(this, null);
    this.#analyzeStyleColor(style);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'dark') {
      const typedNewValue = newValue !== null;
      if (!!this[name] !== typedNewValue) {
        this[name] = newValue === '' ? true : typedNewValue ? newValue : false;
      }
    } else {
      if (this[name] !== newValue) {
        this[name] = newValue;
      }
    }
  }

  #analyzeStyleColor(style) {
    const color = style.color;
    // http://stackoverflow.com/questions/2353211/hsl-to-rgb-color-conversion
    const rgb = color.match(/^rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i);
    const r = parseInt(rgb[1], 10) / 255;
    const g = parseInt(rgb[2], 10) / 255;
    const b = parseInt(rgb[3], 10) / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const luminosity = (max + min) / 2;
    this.dark = luminosity < 0.5;
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

customElements.define('style-swatch', Swatch);
