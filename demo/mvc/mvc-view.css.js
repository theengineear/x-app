// TODO: Replace with .css file when “import attributes” are supported.
const css = strings => strings.join(''); // Cheesy way to get IDE to highlight.

const styleSheet = new CSSStyleSheet();
styleSheet.replaceSync(css`\
:host {
  display: block;
  color: var(--x-default-text-color);
  font-family: var(--x-default-font-family);
  font-size: var(--x-default-font-size);
  font-weight: var(--x-default-font-weight);
  line-height: var(--x-default-line-height);
  letter-spacing: var(--x-default-letter-spacing);
  text-rendering: optimizeLegibility;
}

#page {
  line-height: var(--x-title-line-height);
  font-size: var(--x-title-font-size);
  font-weight: var(--x-title-font-weight);
  letter-spacing: var(--x-title-letter-spacing);
}

#nav {
  line-height: var(--x-caption-line-height);
  font-size: var(--x-caption-font-size);
  font-weight: var(--x-caption-font-weight);
  letter-spacing: var(--x-caption-letter-spacing);
}
`);

export default styleSheet;
