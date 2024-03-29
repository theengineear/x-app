// TODO: Replace with .css file when “import attributes” are supported.
const css = strings => strings.join(''); // Cheesy way to get IDE to highlight.

/** @type {CSSStyleSheet} */
const styleSheet = new CSSStyleSheet();
styleSheet.replaceSync(css`\
:root {
  /* TODO: Are the naming prefixes / suffixes consistent? */
  /* SWATCHES */

  --x-swatch-black: hsl(0, 0%, 0%);
  --x-swatch-white: hsl(0, 0%, 100%);
  --x-swatch-cyan: hsl(191, 100%, 50%);
  --x-swatch-magenta: hsl(304, 100%, 50%);
  --x-swatch-yellow: hsl(60, 100%, 50%);

  --x-swatch-gray-050: hsl(200, 0%, 95%);
  --x-swatch-gray-100: hsl(200, 0%, 90%);
  --x-swatch-gray-200: hsl(200, 0%, 80%);
  --x-swatch-gray-300: hsl(200, 0%, 70%);
  --x-swatch-gray-400: hsl(200, 0%, 60%);
  --x-swatch-gray-500: hsl(200, 0%, 50%);
  --x-swatch-gray-600: hsl(200, 0%, 40%);
  --x-swatch-gray-700: hsl(200, 0%, 30%);
  --x-swatch-gray-800: hsl(200, 0%, 20%);
  --x-swatch-gray-900: hsl(200, 0%, 10%);
  --x-swatch-gray-950: hsl(200, 0%, 5%);

  /* COLOR */

  --x-default-background-color: var(--x-swatch-white);
  --x-default-text-color: var(--x-swatch-black);

  --x-caption-text-color: var(--x-swatch-gray-400);
  --x-label-text-color: var(--x-swatch-gray-600);

  --x-default-divider-color: var(--x-swatch-gray-200);
  --x-primary-divider-color: var(--x-swatch-gray-400);

  /* MARGINS */

  --x-margin-xxsmall: 8px;
  --x-margin-xsmall: 12px;
  --x-margin-small: 16px;
  --x-margin-medium: 24px;
  --x-margin-large: 32px;
  --x-margin-xlarge: 48px;
  --x-margin-xxlarge: 64px;

  --x-margin-default: var(--x-margin-medium);

  /* BORDERS */

  --x-default-border-radius: 5px;
  --x-default-border-width: 2px;

  /* ICONS */

  --x-icon-xxsmall: 12px;
  --x-icon-xsmall: 18px;
  --x-icon-small: 24px;
  --x-icon-medium: 36px;
  --x-icon-large: 48px;
  --x-icon-xlarge: 60px;

  --x-icon-default: var(--x-icon-small);

  /* TRANSITIONS */

  --x-transition-duration-xfast: 100ms;
  --x-transition-duration-fast: 250ms;
  --x-transition-duration-medium: 500ms;
  --x-transition-duration-slow: 750ms;
  --x-transition-duration-xslow: 1250ms;

  --x-transition-timing-function-ease-inout-quart: cubic-bezier(
    0.77,
    0,
    0.175,
    1
  );

  --x-default-transition-duration: var(--x-transition-duration-medium);
  --x-default-transition-timing-function: var(
    --x-transition-timing-function-ease-inout-quart
  );

  /* TYPOGRAPHY */

  --x-default-font-family: sans-serif;
  --x-monospace-font-family: monospace;

  --x-hairline-font-weight: 100;
  --x-thin-font-weight: 200;
  --x-light-font-weight: 300;
  --x-regular-font-weight: 400;
  --x-medium-font-weight: 500;
  --x-semibold-font-weight: 600;
  --x-bold-font-weight: 700;
  --x-heavy-font-weight: 800;
  --x-black-font-weight: 900;

  /* ref: https://material.io/guidelines/style/typography.html#typography-styles */
  --x-display1-font-size: 34px;
  --x-display1-font-weight: var(--x-regular-font-weight);
  --x-display1-line-height: 40px;
  --x-display1-letter-spacing: normal;

  --x-headline-font-size: 24px;
  --x-headline-font-weight: var(--x-regular-font-weight);
  --x-headline-line-height: 32px;
  --x-headline-letter-spacing: normal;

  --x-title-font-size: 20px;
  --x-title-font-weight: var(--x-medium-font-weight);
  --x-title-line-height: 32px;
  --x-title-letter-spacing: normal;

  --x-subheading-font-size: 15px;
  --x-subheading-font-weight: var(--x-regular-font-weight);
  --x-subheading-line-height: 28px;
  --x-subheading-letter-spacing: normal;

  --x-body1-font-size: 13px;
  --x-body1-font-weight: var(--x-regular-font-weight);
  --x-body1-line-height: 24px;
  --x-body1-letter-spacing: normal;

  --x-body2-font-size: var(--x-body1-font-size);
  --x-body2-font-weight: var(--x-semibold-font-weight);
  --x-body2-line-height: var(--x-body1-line-height);
  --x-body2-letter-spacing: var(--x-body1-letter-spacing);

  --x-caption-font-size: 12px;
  --x-caption-font-weight: var(--x-regular-font-weight);
  --x-caption-line-height: 24px;
  --x-caption-letter-spacing: normal;

  --x-default-font-size: var(--x-body1-font-size);
  --x-default-font-weight: var(--x-body1-font-weight);
  --x-default-line-height: var(--x-body1-line-height);
  --x-default-letter-spacing: var(--x-body1-letter-spacing);

  --x-button-font-size: 14px;
  --x-button-font-weight: var(--x-medium-font-weight);
  --x-button-line-height: var(--x-body1-line-height);
  --x-button-letter-spacing: var(--x-body-letter-spacing);

  --x-input-font-size: var(--x-body1-font-size);
  --x-input-font-weight: var(--x-body1-font-weight);
  --x-input-line-height: var(--x-body1-line-height);
  --x-input-letter-spacing: var(--x-body1-letter-spacing);

  /* boundaries */
  --x-default-content-width: 960px;
}
`);

export default styleSheet;
