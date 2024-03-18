/**
 * Wire up an MVC pattern for the demo application.
 */
import Controller from './controller.js';
import Model from './model.js';
import View from './view.js';

const model = new Model();
const view = new View();
const controller = new Controller(model, view);

export default class Root extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.append(view);
    Object.assign(this, { model, view, controller }); // Appended for debugging.
  }
}

customElements.define('mvc-root', Root);
