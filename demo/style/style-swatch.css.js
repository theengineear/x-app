// TODO: Replace with .css file when “import attributes” are supported.
const css = strings => strings.join(''); // Cheesy way to get IDE to highlight.

const styleSheet = new CSSStyleSheet();
styleSheet.replaceSync(css`\
:host {
  display: block;
  width: 640px;
  height: 60px;
  padding: 0 var(--x-margin-default);
  box-sizing: border-box;
  background-color: currentColor;
}

#info {
  display: flex;
  height: 100%;
  align-items: center;
  font-size: var(--x-small-font-size);
  font-weight: var(--x-small-font-weight);
  line-height: var(--x-small-line-height);
  letter-spacing: var(--x-small-letter-spacing);
  color: var(--x-swatch-black);
}

:host([dark]) #info {
  color: var(--x-swatch-white);
}

#label {
  text-transform: uppercase;
}
`);

export default styleSheet;
