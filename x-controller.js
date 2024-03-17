/**
 * @typedef {import('./x-model.js').XModel} XModel
 */

/**
 * Generic controller for MVC architecture.
 * 
 * All controllers should take a “model” and a “view” as arguments. The point of
 * the controller is to listen to events on the “view” and call update methods
 * on the “model” accordingly.
 * 
 * ```js
 * import XModel from '@import/x-app/x-model.js';
 * import XController from '@import/x-app/x-model.js';
 * 
 * class Controller extends XController() {
 *   static initialize(model, view) {
 *     super.initialize(model, view);
 *     // Maybe you want to set up some initial model state.
 *     model.set('initialized', true);
 *   }
 * 
 *   static configureListeners(model, view) {
 *     super.configureListeners(model, view);
 *     // Listen to some events on the view and do something on the model.
 *     view.addEventListener('click', () => {
 *       model.set('clickedAt', performance.now());
 *     });
 *   }
 * }
 * ```
 */
export class XController {
  /**
   * Prefer to override {@link XController.initialize} versus constructor.
   * 
   * @param {XModel} model
   * @param {HTMLElement} view
   */
  constructor(model, view) {
    this.constructor.initialize(model, view);
  }

  /**
   * Binds model to view via {@link XModel.subscribe} and calls
   * {@link XController.configureListeners}.
   * 
   * @param {XModel} model
   * @param {HTMLElement} view
   */
  static initialize(model, view) {
    // bind model to view
    model.subscribe((oldValue, newValue) => {
      this.onModelChange(view, oldValue, newValue);
    });

    // bind user events from the view to the model
    this.configureListeners(model, view);
  }

  /**
   * By default, bind new model value to view when it changes.
   * 
   * @param {HTMLElement} view
   * @param {object} [oldValue]
   * @param {object} [newValue]
   */
  static onModelChange(view, oldValue, newValue) {
    view.model = newValue;
  }

  /**
   * Add event listeners to glue together model and view.
   * 
   * @param {XModel} model
   * @param {HTMLElement} view
   */
  // eslint-disable-next-line no-unused-vars
  static configureListeners(model, view) {}
}
