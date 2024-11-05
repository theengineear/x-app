// @ts-ignore — TypeScript doesn’t understand import attributes yet.
import styleSheet from './x-style.css' with { type: 'css' };

/**
 * Simple wrapper class to provide exportable entity for reimport / export.
 */
export class XStyle {
  /**
   * Add styles to adoptedStyleSheets (if not already adopted).
   * 
   * @param {DocumentOrShadowRoot} target
   * @returns {void}
   */
  static inject(target) {
    if (!target.adoptedStyleSheets.includes(styleSheet)) {
      target.adoptedStyleSheets = [styleSheet, ...target.adoptedStyleSheets];
    }
  }
}

XStyle.inject(document);
