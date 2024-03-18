import { XController } from '../../x-controller.js';
import { XModel } from '../../x-model.js';

class View extends HTMLElement {
  #model = null;
  #guardRemove = true;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.addEventListener('click', event => {
      event.stopPropagation();
      event.preventDefault();
      switch (event.target.id) {
        case 'add-square':
          this.dispatchAddShape('square');
          break;
        case 'add-circle':
          this.dispatchAddShape('circle');
          break;
        case 'remove-shape':
          if (this.#model?.shapes?.length) {
            this.dispatchRemoveShape(this.#model?.shapes?.length - 1);
          }
          break;
        case 'toggle-guard':
          this.#guardRemove = !this.#guardRemove;
          this.render();
          break;
        default:
        // Ignore.
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

  dispatchAddShape(type) {
    const eventType = 'add-shape';
    const eventDetail = { type };
    const eventData = { bubbles: true, composed: true, detail: eventDetail };
    this.dispatchEvent(new CustomEvent(eventType, eventData));
  }

  dispatchRemoveShape(index) {
    const eventType = 'remove-shape';
    const eventDetail = { index };
    const eventData = { bubbles: true, composed: true, detail: eventDetail };
    this.dispatchEvent(new CustomEvent(eventType, eventData));
  }

  render() {
    const model = this.#model;
    const shapes = model?.shapes ?? [];
    const loading = shapes.some(shape => shape.loading);
    const guardRemove = this.#guardRemove;
    const removeDisabled = guardRemove && loading;
    this.shadowRoot.innerHTML = `
      <style>
        li[loading]::after {
          content: "loading\\2026";
        }
        li[shape="square"] {
          list-style-type: square;
        }
        li[shape="circle"] {
          list-style-type: circle;
        }
        #remove-shape:enabled[loading] {
          color: red;
        }
        #remove-shape:disabled {
          cursor: not-allowed;
        }
      </style>
      <button id="add-square" type="button">Add Square</button>
      <button id="add-circle" type="button">Add Circle</button>
      <button
        id="remove-shape"
        type="button"
        ${loading ? 'loading' : ''}
        ${removeDisabled ? 'disabled' : ''}>
        Remove Shape
      </button>
      <button id="toggle-guard" type="button">
        ${guardRemove ? `Don't Guard Remove` : 'Guard Remove'}
      </button>
      <ul>
        ${shapes.map(shape => {
          return `<li ${shape.loading ? 'loading' : ''} shape="${shape.type}">${shape.text ?? ''}</li>`;
        }).join('')}
      </ul>
    `;
  }

  connectedCallback() {
    this.render();
  }
}
customElements.define('model-view', View);

class ShapesModel extends XModel {
  async add(type) {
    const index = this.value?.length ?? 0;
    this.set(index, { type, loading: true });
    await new Promise(res => setTimeout(res, 1000));
    this.set([index, 'text'], `This is a ${type}.`);
    this.set([index, 'loading'], false);
  }
  destroy(index) {
    if (this.get([index, 'loading'])) {
      throw new Error('Cannot destroy shape before it is loaded.');
    } else {
      this.value = this.value.toSpliced(index, 1);
    }
  }
}

class Model extends XModel {
  constructor(input) {
    super(input);
    const child = new ShapesModel();
    this.attachChild('shapes', child);
  }
  get shapes() {
    return this.getChild('shapes');
  }
  addShape(type) {
    this.shapes.add(type);
  }
  destroyShape(index) {
    this.shapes.destroy(index);
  }
}

class DemoController extends XController {
  static configureListeners(model, view) {
    view.addEventListener('add-shape', evt => {
      const { type } = evt.detail;
      model.addShape(type);
    });
    view.addEventListener('remove-shape', evt => {
      const { index } = evt.detail;
      model.destroyShape(index);
    });
  }
}

const model = new Model();
const view = document.createElement('model-view');
new DemoController(model, view);
document.getElementById('root').append(view);
