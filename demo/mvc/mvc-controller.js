// TODO: Make everything async / scalable for child getters.

import XController from '../../x-controller.js';
import XRouter from '../../x-router.js';

export default class MvcController extends XController {
  static initializeRoutes(model) {
    // Set up wildcard route handlers.
    XRouter.set('*', url => {
      if (url.pathname.match(/[^/]\/$/)) {
        // No match and a single, trailing slash. Remove it and try again.
        const next = new URL(url);
        next.pathname = location.pathname.slice(0, -1);
        history.replaceState({}, null, next.href);
        XRouter.read();
      } if (url.pathname.endsWith('index.html')) {
        // This is just an initial load. Redirect to home.
        const next = new URL('/', url).href;
        history.replaceState({}, null, next);
        XRouter.read();
      } else {
        model.load('not-found', url);
      }
    });

    // Set up custom route handlers.
    XRouter.set('/', url => {
      const next = new URL('/todo-list', url).href;
      history.replaceState({}, null, next);
      XRouter.read();
    });
    XRouter.set('/todo-list', (url, params) => {
      model.load('todo-list', url, params);
    });
    XRouter.set('/todo-list/:todoId', (url, params) => {
      model.load('todo-detail', url, params);
    });

    // Configure listeners to trigger SPA-style routing.
    addEventListener('popstate', () => { XRouter.read(); });
    addEventListener('click', event => {
      const url = XRouter.resolve(event);
      if (url) {
        event.preventDefault();
        event.stopPropagation();
        history.pushState({}, null, url);
        XRouter.read();
      }
    });
  }

  static initialize(model, view) {
    super.initialize(model, view);
    this.initializeRoutes(model);
    XRouter.read();
  }

  static configureListeners(model, view) {
    view.addEventListener('mvc-todo-create-todo', event => {
      const { name } = event.detail;
      model.createTodo(name);
    });

    view.addEventListener('mvc-todo-create-task', event => {
      const { todoId, description } = event.detail;
      model.createTask(todoId, description);
    });
  }
}
