// TODO: Replace with .css file when “import attributes” are supported.
const css = strings => strings.join(''); // Cheesy way to get IDE to highlight.

const styleSheet = new CSSStyleSheet();
styleSheet.replaceSync(css`\
:host {
  display: flex;
  padding: var(--x-margin-small) 0;
  box-sizing: border-box;
}

#info {
  width: 156px;
  flex-shrink: 0;
  font-size: var(--x-caption-font-size);
  font-weight: var(--x-caption-font-weight);
  letter-spacing: var(--x-caption-letter-spacing);
  color: var(--x-label-text-color);
}

#label {
  text-transform: uppercase;
}
`);

export default styleSheet;
