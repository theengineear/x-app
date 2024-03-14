/**
 * Generic controller for MVC architecture.
 *
 * All controllers should take a `model` and a `view` as arguments. The point of
 * the controller is to listen to events on the `view` and call update methods
 * on the `model` accordingly.
 */

export default class XController {
  constructor(model, view) {
    this.constructor.initialize(model, view);
  }

  static initialize(model, view) {
    // bind model to view
    model.subscribe((oldValue, newValue) => {
      this.onModelChange(view, oldValue, newValue);
    });

    // bind user events from the view to the model
    this.configureListeners(model, view);
  }

  static onModelChange(view, oldValue, newValue) {
    view.model = newValue;
  }

  // eslint-disable-next-line no-unused-vars
  static configureListeners(model, view) {}
}
