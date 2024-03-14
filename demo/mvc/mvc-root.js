/**
 * Wire up an MVC pattern for the demo application.
 */
import MvcController from './mvc-controller.js';
import MvcModel from './mvc-model.js';
import MvcView from './mvc-view.js';

const model = new MvcModel();
const view = new MvcView();
const controller = new MvcController(model, view);

export default class MvcRoot extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.append(model, view); // Model is appended for debugging.
    Object.assign(this, { model, view, controller });
  }
}

customElements.define('mvc-root', MvcRoot);
