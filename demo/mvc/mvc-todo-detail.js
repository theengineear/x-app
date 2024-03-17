import '../../x-style.js';
import styleSheet from './mvc-todo-detail.css.js';

const template = document.createElement('template');
template.innerHTML = `\
<div id="container">
  <div id="name"></div>
  <div id="description"></div>
  <div id="tasks-label">Tasks</div>
  <div id="tasks"></div>
  <button id="create-task" type="button">Add Task</button>
</div>
`;

export default class MvcTodoDetail extends HTMLElement {
  #model = null;
  #queued = false;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.adoptedStyleSheets = [styleSheet];
    this.shadowRoot.append(template.content.cloneNode(true));
    this.shadowRoot.addEventListener('click', event => {
      const creatList = this.shadowRoot.getElementById('create-task');
      if (creatList.contains(event.target)) {
        const eventType = 'mvc-todo-create-task';
        const description = 'New task.';
        const todoId = this.#model?.params?.todoId;
        const detail = { todoId, description };
        const eventData = { bubbles: true, composed: true, detail };
        this.dispatchEvent(new CustomEvent(eventType, eventData));
      }
    });
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
    const todoId = model?.params?.todoId;
    const todo = model?.todo?.data?.todos?.find(candidate => candidate.todoId === todoId);
    const tasks = todo?.tasks ?? [];
    while(this.shadowRoot.getElementById('tasks').firstElementChild) {
      this.shadowRoot.getElementById('tasks').firstElementChild.remove();
    }
    const tasksFragment = new DocumentFragment();
    for (const task of tasks) {
      const taskElement = document.createElement('div');
      taskElement.classList.add('task');
      const taskDescriptionElement = document.createElement('div');
      taskDescriptionElement.classList.add('task-description');
      taskDescriptionElement.textContent = task.description;
      taskElement.append(taskDescriptionElement);
      tasksFragment.append(taskElement);
    }
    this.shadowRoot.getElementById('tasks').append(tasksFragment);
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

customElements.define('mvc-todo-detail', MvcTodoDetail);
