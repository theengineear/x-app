import '../../x-style.js';
import styleSheet from './mvc-todo-list.css.js';

const template = document.createElement('template');
template.innerHTML = `\
<div id="container">
  <div id="todos-label">Your &ldquo;TODO&rdquo; lists.</div>
  <div id="todos"></div>
  <button id="create-todo" type="button">Add Todo List</button>
</div>
`;

export default class MvcTodoList extends HTMLElement {
  #model = null;
  #queued = false;

  set model(value) {
    this.#model = value;
    this.#queue();
  }

  get model() {
    return this.#model;
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.adoptedStyleSheets = [styleSheet];
    this.shadowRoot.append(template.content.cloneNode(true));
    this.shadowRoot.addEventListener('click', event => {
      const creatList = this.shadowRoot.getElementById('create-todo');
      if (creatList.contains(event.target)) {
        const eventType = 'mvc-todo-create-todo';
        const name = 'Untitled';
        const detail = { name };
        const eventData = { bubbles: true, composed: true, detail };
        this.dispatchEvent(new CustomEvent(eventType, eventData));
      }
    });
  }

  render() {
    const model = this.#model;
    const href = model?.href;
    const todos = model?.todo?.data?.todos ?? [];
    while(this.shadowRoot.getElementById('todos').firstElementChild) {
      this.shadowRoot.getElementById('todos').firstElementChild.remove();
    }
    const todosFragment = new DocumentFragment();
    for (const todo of todos) {
      const todoHref = href ? new URL(`/todo-list/${todo.todoId}`, href).href : undefined;
      const todoElement = document.createElement('div');
      todoElement.classList.add('todo');
      const todoNameElement = document.createElement('a');
      todoNameElement.classList.add('todo-name');
      todoNameElement.href = todoHref;
      todoNameElement.textContent = todo.name;
      todoElement.append(todoNameElement);
      todosFragment.append(todoElement);
    }
    this.shadowRoot.getElementById('todos').append(todosFragment);
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

customElements.define('mvc-todo-list', MvcTodoList);
