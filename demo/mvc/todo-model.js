// TODO: Support “slugs” for nicer urls.

import { XModel } from '../../x-model.js';

export default class TodoModel extends XModel {
  async load() {
    const data = JSON.parse(localStorage.getItem('mvc-todo-model') ?? '{}');
    await Promise.resolve();
    this.set('data', data);
  }

  async sync() {
    await Promise.resolve();
    localStorage.setItem('mvc-todo-model', JSON.stringify(this.get('data')));
  }

  async createTodo(name) {
    const todoId = TodoModel.#uuid();
    await this.load();
    const todosPath = ['data', 'todos'];
    const todos = this.get(todosPath) ?? [];
    this.set(todosPath, todos.toSpliced(0, 0, { todoId, name }));
    await this.sync();
    return todoId;
  }

  async createTask(todoId, description) {
    const taskId = TodoModel.#uuid();
    await this.load();
    const todosPath = ['data', 'todos'];
    const todos = this.get(todosPath);
    const todo = todos.find(candidate => candidate.todoId === todoId);
    const tasks = todo.tasks ?? [];
    const index = todos.indexOf(todo);
    this.set(todosPath, todos.with(index, { ...todo, tasks: tasks.toSpliced(0, 0, { taskId, description }) }));
    await this.sync();
  }

  // https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
  static #uuid() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
      // eslint-disable-next-line no-bitwise
      (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16)
    );
  }
}
