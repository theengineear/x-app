// TODO: Replace with .css file when “import attributes” are supported.
const css = strings => strings.join(''); // Cheesy way to get IDE to highlight.

const styleSheet = new CSSStyleSheet();
styleSheet.replaceSync(css`\
:host {
  display: block;
}

#todos-label {
  line-height: var(--x-body2-line-height);
  font-size: var(--x-body2-font-size);
  font-weight: var(--x-body2-font-weight);
  letter-spacing: var(--x-body2-letter-spacing);
}

#todos {
  display: flex;
  flex-wrap: wrap;
  gap: var(--x-margin-xxsmall);
}

.todo {
  box-sizing: border-box;
  padding: var(--x-margin-xxsmall);
  width: 400px;
  height: 200px;
  box-shadow: inset 0 0 0 1px black;
}

.todo-name {
  line-height: var(--x-body1-line-height);
  font-size: var(--x-body1-font-size);
  font-weight: var(--x-body1-font-weight);
  letter-spacing: var(--x-body1-letter-spacing);
}
`);

export default styleSheet;
