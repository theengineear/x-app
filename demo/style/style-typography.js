import '../../x-style.js';
import styleSheet from './style-typography.css' with { type: 'css' };

const template = document.createElement('template');
template.innerHTML = `\
<div id="info">
  <span id="label"></span>
</div>
<div>Etiam sed mauris rhoncus, pellentesque risus vehicula, scelerisque tellus. Praesent in diam id urna hendrerit iaculis. Maecenas sed mattis dui, sit amet fermentum arcu. Curabitur dapibus finibus ipsum, et scelerisque mauris. Proin commodo mattis, vitae ipsum.</div>
`;

export default class StyleTypography extends HTMLElement {
  #queued = false;
  #label = null;
  #spec = null;

  static get observedAttributes() {
    return ['label', 'spec'];
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

  render() {
    const { label } = this;
    this.shadowRoot.getElementById('label').textContent = label ?? '';
  }

  connectedCallback() {
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

customElements.define('style-typography', StyleTypography);
