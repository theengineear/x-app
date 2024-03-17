import { XModel } from '../../x-model.js';
import { XController } from '../../x-controller.js';

// The core part of this demo is to show how we configure a basic controller.
class Controller extends XController {
  static configureListeners(model, view) {
    view.addEventListener('controller-increment', () => {
      model.set('count', model.get('count') + 1);
    });
  }
}

class View extends HTMLElement {
  #model = null;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.addEventListener('click', event => {
      if (event.target.id === 'trigger') {
        this.dispatchEvent(
          new CustomEvent('controller-increment', { bubbles: true, composed: true })
        );
      }
    });
  }

  set model(value) {
    this.#model = value;
    this.render();
  }

  get model() {
    return this.#model;
  }

  render() {
    const model = this.#model;
    const count = model?.count ?? 0;
    this.shadowRoot.innerHTML = `
      <button id="trigger" type="button">Click Me</button>
      Count: <span id="count">${count}</span>
    `;
  }

  connectedCallback() {
    this.render();
  }
}
customElements.define('controller-view', View);

const model = new XModel({ value: { count: 0 } });
const view = new View();
const root = document.getElementById('root');
new Controller(model, view);
root.append(model, view);
