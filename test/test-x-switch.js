import '../x-switch.js';
import { assert, it } from '@netflix/x-test/x-test.js';

class AbstractTestElement extends HTMLElement {
  #string = null;
  set string(value) {
    this.#string = value;
    this.render();
  }
  get string() {
    return this.#string;
  }
  render() {
    this.textContent = this.#string ?? '';
  }
  connectedCallback() {
    this.render();
  }
}

class TestElementOne extends AbstractTestElement {}
customElements.define('test-element-one', TestElementOne);

class TestElementTwo extends AbstractTestElement {}
customElements.define('test-element-two', TestElementTwo);

it('initial render synchronously renders children', () => {
  const element = document.createElement('x-switch');
  element.tag = 'x-switch';
  // The nesting here renders a tree of x-switch elements with a final
  // test-element-one element.
  element.properties = {
    tag: 'x-switch',
    properties: {
      tag: 'x-switch',
      properties: {
        tag: 'test-element-one',
        properties: {
          string: 'foo',
        },
      },
    },
  };

  // Before connection, there's not really anything going on.
  assert(element.localName === 'x-switch');
  assert(!element.firstElementChild);

  // Upon our initial connection, the entire tree should render synchronously.
  document.body.append(element);
  assert(element.localName === 'x-switch');
  assert(element.firstElementChild.localName === 'x-switch');
  assert(element.firstElementChild.firstElementChild.localName === 'x-switch');
  assert(element.firstElementChild.firstElementChild.firstElementChild.localName === 'x-switch');
  assert(element.firstElementChild.firstElementChild.firstElementChild.firstElementChild.localName === 'test-element-one');
  assert(element.querySelector('test-element-one') === element.firstElementChild.firstElementChild.firstElementChild.firstElementChild);
  assert(element.querySelector('test-element-one').string === 'foo');
  assert(element.querySelector('test-element-one').textContent === 'foo');
});

it('correctly updates when tag or properties change', async () => {
  const element = document.createElement('x-switch');
  element.tag = 'test-element-one';
  element.properties = { string: 'foo' };

  // Before connection, there's not really anything going on.
  assert(element.localName === 'x-switch');
  assert(!element.firstElementChild);

  // Upon our initial connection, the entire tree should render synchronously.
  document.body.append(element);
  assert(element.firstElementChild.localName === 'test-element-one');
  assert(element.firstElementChild.string === 'foo');
  assert(element.firstElementChild.textContent === 'foo');

  // When we change the tag, the new element gets the previous properties.
  element.tag = 'test-element-two';

  // Note that we are _updating_ here, and so we await a microtask to see the
  // change to the DOM. Interestingly, because the element is _new_ this change
  // is synchronous. We don't strictly depend on that though and it would be ok
  // to relax.
  await Promise.resolve();
  assert(element.firstElementChild.localName === 'test-element-two');
  assert(element.firstElementChild.string === 'foo');
  assert(element.firstElementChild.textContent === 'foo');

  // When we change the properties, the current element gets the new properties.
  element.properties = { string: 'bar' };

  // Again, we're _updating_, so we await a microtask to see the DOM change.
  await Promise.resolve();
  assert(element.firstElementChild.string === 'bar');
  assert(element.firstElementChild.textContent === 'bar');

  // Changing both at the same time should also work.
  element.tag = 'test-element-one';
  element.properties = { string: 'baz' };

  // Again, due to a quirk of creating a new element here, this secondary update
  // will be synchronous. Again, not a requirement, just a quirk.
  await Promise.resolve();
  assert(element.firstElementChild.localName === 'test-element-one');
  assert(element.firstElementChild.string === 'baz');
  assert(element.firstElementChild.textContent === 'baz');
});
