// TODO: Replace with .css file when “import attributes” are supported.
const css = strings => strings.join(''); // Cheesy way to get IDE to highlight.

const styleSheet = new CSSStyleSheet();
styleSheet.replaceSync(css`\
:host {
  display: block;
}
`);

export default styleSheet;
