// TODO: Make everything async / scalable for child getters.

import { XModel } from '../../x-model.js';
import MvcTodoModel from './mvc-todo-model.js';

export default class MvcModel extends XModel {
  get todo() {
    if (!this.hasChild('todo')) {
      this.setChild('todo', new MvcTodoModel());
    }
    return this.getChild('todo');
  }

  load(page, url, params) {
    this.set('page', page);
    this.set('href', url.href);
    this.set('params', params ? Object.fromEntries(params.entries()) : {});
    switch (page) {
      case 'todo-list':
      case 'todo-detail':
        this.todo.load();
        break;
      case 'not-found':
        // TODO: Show a silly “TODO — Make a 404 Page” page or something.
        break;
      default:
        throw new Error(`Unexpected page "${page}".`);
    }
  }

  async createTodo(name) {
    await this.todo.createTodo(name);
  }

  async createTask(todoId, description) {
    await this.todo.createTask(todoId, description);
  }
}

MvcModel.register();
