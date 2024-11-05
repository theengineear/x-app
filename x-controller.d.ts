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
     * Binds model to view via {@link XModel.subscribe} and calls
     * {@link XController.configureListeners}.
     *
     * @param {XModel} model
     * @param {HTMLElement} view
     */
    static initialize(model: any, view: HTMLElement): void;
    /**
     * By default, bind new model value to view when it changes.
     *
     * @param {HTMLElement} view
     * @param {object} [oldValue]
     * @param {object} [newValue]
     */
    static onModelChange(view: HTMLElement, oldValue?: object, newValue?: object): void;
    /**
     * Add event listeners to glue together model and view.
     *
     * @param {XModel} model
     * @param {HTMLElement} view
     */
    static configureListeners(model: any, view: HTMLElement): void;
    /**
     * TODO: TypeScript somehow thinks we want to import from the “.d.ts” file
     * when we try and import our XModel typedef here. This is just a workaround.
     * Ideally, we could just (at)import it.
     * @typedef {object} XModel
     */
    /**
     * Prefer to override {@link XController.initialize} versus constructor.
     *
     * @param {XModel} model
     * @param {HTMLElement} view
     */
    constructor(model: any, view: HTMLElement);
}
//# sourceMappingURL=x-controller.d.ts.map