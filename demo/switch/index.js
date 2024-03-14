// Define the elements we'll switch between.
const template = document.createElement('template');
template.innerHTML = `\
<div>
  <span id="label"></span> — <span id="count"></span> — <span id="value"></span>
</div>
`;
class AbstractSwitch extends HTMLElement {
  #label = null;
  #count = 0;
  #value = null;
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.append(template.content.cloneNode(true));
  }
  set count(value) {
    this.#count = value;
    this.render();
  }
  get count() {
    return this.#count;
  }
  set value(value) {
    this.#value = value;
    this.render();
  }
  get value() {
    return this.#value;
  }
  set label(value) {
    this.#label = value;
    this.render();
  }
  get label() {
    return this.#label;
  }
  render() {
    const { label, count, value } = this;
    this.shadowRoot.getElementById('label').textContent = label ?? '';
    this.shadowRoot.getElementById('count').textContent = count?.toLocaleString() ?? '';
    this.shadowRoot.getElementById('value').textContent = value ?? '';
  }
  connectedCallback() {
    this.render();
  }
}

class SwitchOne extends AbstractSwitch {
  constructor() {
    super();
    this.label = 'One';
  }
}
class SwitchTwo extends AbstractSwitch {
  constructor() {
    super();
    this.label = 'Two';
  }
}
class SwitchThree extends AbstractSwitch {
  constructor() {
    super();
    this.label = 'Three';
  }
}
customElements.define('switch-one', SwitchOne);
customElements.define('switch-two', SwitchTwo);
customElements.define('switch-three', SwitchThree);

// Define our custom method of piping changes to x-switch, this could also be
// done through a computed property pipeline in a real application.
const updateXSwitchTag = tag => {
  const xSwitch = document.getElementById('switch');
  xSwitch.tag = tag;
};
const properties = { count: 0, value: '' };
const updateXSwitchProperties = () => {
  const xSwitch = document.getElementById('switch');
  xSwitch.properties = { ...properties };
};

// Add listeners to update the state of our demo.
document.addEventListener('click', event => {
  switch (event.target.id) {
    case 'one':
      updateXSwitchTag('switch-one');
      break;
    case 'two':
      updateXSwitchTag('switch-two');
      break;
    case 'three':
      updateXSwitchTag('switch-three');
      break;
    case 'invalid':
      updateXSwitchTag('not a valid tag name');
      break;
    case 'none':
      updateXSwitchTag(null);
      break;
  }
});
document.addEventListener('input', event => {
  switch (event.target.id) {
    case 'value':
      properties.value = event.target.value;
      updateXSwitchProperties();
      break;
  }
});
document.addEventListener('DOMContentLoaded', () => {
  properties.value = document.getElementById('value').value;
  updateXSwitchProperties();
  // Add a self-updating counter to make it obvious that updates work as expected.
  setInterval(() => {
    properties.count++;
    updateXSwitchProperties();
  }, 100);
});
