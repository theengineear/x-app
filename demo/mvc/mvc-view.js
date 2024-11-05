// TODO: Make everything async / scalable for child getters.

import '../../x-style.js';
import '../../x-switch.js';
import './mvc-todo-detail.js';
import './mvc-todo-list.js';
import styleSheet from './mvc-view.css' with { type: 'css' };

const template = document.createElement('template');
template.innerHTML = `\
<div id="container">
  <div id="page"></div>
  <nav id="nav">
    <a id="home">home</a>
    <a id="todo-list">todo lists</a>
  </nav>
  <x-switch id="switch"></x-switch>
</div>
`;

export default class MvcView extends HTMLElement {
  #model = null;
  #queued = false;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.adoptedStyleSheets = [styleSheet];
    this.shadowRoot.append(template.content.cloneNode(true));
  }

  set model(value) {
    this.#model = value;
    this.#queue();
  }

  get model() {
    return this.#model;
  }

  render() {
    const model = this.#model;
    const page = model?.page;
    const href = model?.href;
    const homeHref = href ? new URL('/', href).href : undefined;
    const todoListHref = href ? new URL('/todo-list', href).href : undefined;
    let tag;
    switch (page) {
      case 'todo-list':
        tag = 'mvc-todo-list';
        break;
      case 'todo-detail':
        tag = 'mvc-todo-detail';
        break;
    }
    let properties = {};
    switch(tag) {
      case 'mvc-todo-list':
      case 'mvc-todo-detail':
        properties = { model };
        break;
    }
    this.shadowRoot.getElementById('page').textContent = page ?? '';
    this.shadowRoot.getElementById('home').href = homeHref;
    this.shadowRoot.getElementById('todo-list').href = todoListHref;
    Object.assign(this.shadowRoot.getElementById('switch'), { tag, properties });
  }

  connectedCallback() {
    this.render();
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

customElements.define('mvc-view', MvcView);
