import { assert, describe, it } from '@netflix/x-test/x-test.js';
import XModel, { Deep, Store } from '../x-model.js';

describe('deep', () => {
  it('pathToKeys handles ""', () => {
    const actual = Deep.pathToKeys('');
    assert(actual.length === 1);
    assert(actual[0] === '');
  });

  it('pathToKeys handles "a"', () => {
    const actual = Deep.pathToKeys('a');
    assert(actual.length === 1);
    assert(actual[0] === 'a');
  });

  it('pathToKeys handles "one.two.oo.3.-1"', () => {
    const actual = Deep.pathToKeys('one.two.oo.3.-1');
    assert(actual.length === 5);
    assert(actual[0] === 'one');
    assert(actual[1] === 'two');
    assert(actual[2] === 'oo');
    assert(actual[3] === 3);
    assert(actual[4] === '-1');
  });

  it('clone returns scalars as-is', () => {
    assert(Deep.clone() === undefined);
    assert(Deep.clone(null) === null);
    assert(Deep.clone('a') === 'a');
    assert(Deep.clone(5) === 5);
  });

  it('clone changes top and nested references', () => {
    const obj = { a: { b: { c: {} } } };
    Object.freeze(obj);
    Object.freeze(obj.a);
    Object.freeze(obj.a.b);
    Object.freeze(obj.a.b.c);
    const clone = Deep.clone(obj);
    assert(clone !== obj);
    assert(clone.a !== obj.a);
    assert(clone.a.b !== obj.a.b);
    assert(clone.a.b.c !== obj.a.b.c);
    assert(JSON.stringify(clone) === JSON.stringify(obj));
  });

  it('clone works on arrays', () => {
    const obj = [1, 2, 3];
    Object.freeze(obj);
    const clone = Deep.clone(obj);
    assert(clone !== obj);
    assert(JSON.stringify(clone) === JSON.stringify(obj));
  });

  it('shallow clone returns scalars as-is', () => {
    assert(Deep.clone(undefined, true) === undefined);
    assert(Deep.clone(null, true) === null);
    assert(Deep.clone('a', true) === 'a');
    assert(Deep.clone(5, true) === 5);
  });

  it('shallow clone changes only top reference', () => {
    const obj = { a: { b: { c: {} } } };
    Object.freeze(obj);
    Object.freeze(obj.a);
    Object.freeze(obj.a.b);
    Object.freeze(obj.a.b.c);
    const clone = Deep.clone(obj, true);
    assert(clone !== obj);
    assert(clone.a === obj.a);
    assert(clone.a.b === obj.a.b);
    assert(clone.a.b.c === obj.a.b.c);
    assert(JSON.stringify(clone) === JSON.stringify(obj));
  });

  it('shallow clone works on arrays', () => {
    const obj = [1, 2, 3];
    Object.freeze(obj);
    const clone = Deep.clone(obj, true);
    assert(clone !== obj);
    assert(JSON.stringify(clone) === JSON.stringify(obj));
  });

  it('shallow clone does not convert empty to undefined in arrays', () => {
    const array = [];
    array[1] = null;
    const clone = Deep.clone(array, true);
    assert(Reflect.has(clone, 0) === false);
    assert(Reflect.get(clone, 1) === null);
  });

  it('freeze should always return undefined', () => {
    assert(Deep.freeze({}) === undefined);
    assert(Deep.freeze(1) === undefined);
    assert(Deep.freeze(null) === undefined);
    assert(Deep.freeze(undefined) === undefined);
  });

  it('freeze should recursively freeze', () => {
    const value = { a: 'a', b: { c: 'c' } };
    Deep.freeze(value);
    assert(Object.isFrozen(value) === true);
    assert(Object.isFrozen(value.b) === true);
  });

  it('equal should work on primitives', () => {
    assert(Deep.equal('a', 'a') === true);
    assert(Deep.equal(null, null) === true);
    assert(Deep.equal('a', 'b') === false);
    assert(Deep.equal(null, undefined) === false);
  });

  it('equal should work on objects', () => {
    assert(Deep.equal({}, {}) === true);
    assert(Deep.equal({ a: 'a' }, {}) === false);
    assert(Deep.equal({ a: 'a' }, { a: 'a' }) === true);
    assert(Deep.equal({ a: { b: 'b' } }, { a: { b: 'b' } }) === true);
    assert(Deep.equal({ a: { b: undefined } }, { a: {} }) === false);
  });

  it('has should throw for invalid paths', () => {
    let threwForUndefined = false;
    let threwForNull = false;
    try {
      Deep.has({}, undefined);
    } catch (err) {
      threwForUndefined = true;
    }
    try {
      Deep.has({}, null);
    } catch (err) {
      threwForNull = true;
    }
    assert(threwForUndefined);
    assert(threwForNull);
  });

  it('has should handle valid paths', () => {
    assert(Deep.has(undefined, 'a.b') === false);
    assert(Deep.has(null, 'a.b') === false);
    assert(Deep.has('a', 'a.b') === false);
    assert(Deep.has(true, 'a.b') === false);
    assert(Deep.has(5, 'a.b') === false);
    assert(Deep.has({ a: undefined }, 'a.b') === false);
    assert(Deep.has({ a: null }, 'a.b') === false);
    assert(Deep.has({ a: 'a' }, 'a.b') === false);
    assert(Deep.has({ a: true }, 'a.b') === false);
    assert(Deep.has({ a: 5 }, 'a.b') === false);
    assert(Deep.has({}, 'a.b') === false);
  });

  it('has should work for deeply nested paths', () => {
    const actual = Deep.has({ a: { b: [{ c: 'C' }] } }, 'a.b.0.c');
    assert(actual === true);
  });

  it('get should throw for invalid paths', () => {
    let threwForUndefined = false;
    let threwForNull = false;
    try {
      Deep.get({}, undefined);
    } catch (err) {
      threwForUndefined = true;
    }
    try {
      Deep.get({}, null);
    } catch (err) {
      threwForNull = true;
    }
    assert(threwForUndefined);
    assert(threwForNull);
  });

  it('get should handle valid paths', () => {
    assert(Deep.get(undefined, 'a.b') === undefined);
    assert(Deep.get(null, 'a.b') === undefined);
    assert(Deep.get('a', 'a.b') === undefined);
    assert(Deep.get(true, 'a.b') === undefined);
    assert(Deep.get(5, 'a.b') === undefined);
    assert(Deep.get({ a: undefined }, 'a.b') === undefined);
    assert(Deep.get({ a: null }, 'a.b') === undefined);
    assert(Deep.get({ a: 'a' }, 'a.b') === undefined);
    assert(Deep.get({ a: true }, 'a.b') === undefined);
    assert(Deep.get({ a: 5 }, 'a.b') === undefined);
    assert(Deep.get({}, 'a.b') === undefined);
  });

  it('get should work for deeply nested paths', () => {
    const actual = Deep.get({ a: { b: [{ c: 'C' }] } }, 'a.b.0.c');
    assert(actual === 'C');
  });

  it('set should throw for invalid paths', () => {
    let threwForUndefined = false;
    let threwForNull = false;
    try {
      Deep.set({}, undefined);
    } catch (err) {
      threwForUndefined = true;
    }
    try {
      Deep.set({}, null);
    } catch (err) {
      threwForNull = true;
    }
    assert(threwForUndefined);
    assert(threwForNull);
  });

  it('should handle valid paths', () => {
    const string = JSON.stringify({ a: { b: 'B' } });
    assert(JSON.stringify(Deep.set(undefined, 'a.b', 'B')) === string);
    assert(JSON.stringify(Deep.set(null, 'a.b', 'B')) === string);
    assert(JSON.stringify(Deep.set('a', 'a.b', 'B')) === string);
    assert(JSON.stringify(Deep.set(true, 'a.b', 'B')) === string);
    assert(JSON.stringify(Deep.set(5, 'a.b', 'B')) === string);
    assert(JSON.stringify(Deep.set({ a: undefined }, 'a.b', 'B')) === string);
    assert(JSON.stringify(Deep.set({ a: null }, 'a.b', 'B')) === string);
    assert(JSON.stringify(Deep.set({ a: 'a' }, 'a.b', 'B')) === string);
    assert(JSON.stringify(Deep.set({ a: true }, 'a.b', 'B')) === string);
    assert(JSON.stringify(Deep.set({ a: 5 }, 'a.b', 'B')) === string);
    assert(JSON.stringify(Deep.set({}, 'a.b', 'B')) === string);
  });

  it('set should work for deeply nested paths', () => {
    const actual = Deep.set({ a: { b: [{ c: 'C' }] } }, 'a.b.0.c', 'see');
    const string = JSON.stringify({ a: { b: [{ c: 'see' }] } });
    assert(JSON.stringify(actual) === string);
  });

  it('set should noop if value is exactly the same', () => {
    const obj = { a: { b: {} } };
    Object.freeze(obj);
    Object.freeze(obj.a);
    Object.freeze(obj.a.b);
    assert(Deep.set(obj, 'a.b', obj.a.b) === obj);
  });

  it('delete should throw for invalid paths', () => {
    let threwForUndefined = false;
    let threwForNull = false;
    try {
      Deep.delete({}, undefined);
    } catch (err) {
      threwForUndefined = true;
    }
    try {
      Deep.delete({}, null);
    } catch (err) {
      threwForNull = true;
    }
    assert(threwForUndefined);
    assert(threwForNull);
  });

  it('delete should handle valid paths', () => {
    assert(Deep.delete(undefined, 'a.b', 'B') === undefined);
    assert(Deep.delete(null, 'a.b', 'B') === null);
    assert(Deep.delete('a', 'a.b', 'B') === 'a');
    assert(Deep.delete(true, 'a.b', 'B') === true);
    assert(Deep.delete(5, 'a.b', 'B') === 5);
  });

  it('delete should work for deeply nested paths', () => {
    const actual = Deep.delete({ a: { b: [{ c: 'C' }] } }, 'a.b.0.c', 'see');
    const string = JSON.stringify({ a: { b: [{}] } });
    assert(JSON.stringify(actual) === string);
  });

  it('delete should noop if value does not exist', () => {
    const obj = {};
    assert(Deep.delete(obj, 'a.b') === obj);
  });
});

describe('store', () => {
  it('value getter', () => {
    const store = new Store();
    assert(store.value === undefined);
    assert(store.hasValue() === false);
    store.value = 'foo';
    assert(store.value === 'foo');
    assert(store.hasValue() === true);
    store.removeValue();
    assert(store.value === undefined);
    assert(store.hasValue() === false);
  });

  it('has/get/set/remove (no-path argument)', () => {
    const store = new Store();
    assert(store.has() === false);
    assert(store.get() === undefined);
    store.set({});
    assert(store.has() === true);
    assert(Deep.equal(store.get(), {}));
    store.remove();
    assert(store.has() === false);
    assert(store.get() === undefined);
  });

  it('has/get/set/remove (path argument)', () => {
    const store = new Store();
    const path = 'foo.bar';
    assert(store.has(path) === false);
    assert(store.get(path) === undefined);
    store.set(path, {});
    assert(store.has(path) === true);
    assert(Deep.equal(store.get(path), {}));
    store.remove(path);
    assert(store.has(path) === false);
    assert(store.get(path) === undefined);
    assert(Deep.equal(store.get(), { foo: {} }));
  });

  it('subscribe callback is called on subscribe', async () => {
    // This is important. Change sets in stores should be considered atomic.
    // If we allow a callback in the middle of a synchronous set of changes,
    // we might get a callback with a partial change.
    const store = new Store();
    store.set('foo', 'bar');

    // Allow initial invalidation to complete.
    await true;

    let callbackCount = 0;
    let oldValueRef;
    let newValueRef;
    store.subscribe((oldValue, newValue) => {
      callbackCount++;
      oldValueRef = oldValue;
      newValueRef = newValue;
    });

    store.remove('foo');

    // We should get a callback upon connection. This allows subscribers to
    // connect whenever they want. However, we will get the latest *atomic*
    // change, so the synchronous change above will not be seen yet.
    assert(Deep.equal(store.value, {}));
    assert(callbackCount === 1);
    assert(oldValueRef === undefined);
    assert(Deep.equal(newValueRef, { foo: 'bar' }));

    store.set('moo', 'mar');

    // Awaiting our invalidation debouncer will call us back with the next
    // atomic change.
    await true;
    assert(Deep.equal(store.value, { moo: 'mar' }));
    assert(callbackCount === 2);
    assert(Deep.equal(oldValueRef, { foo: 'bar' }));
    assert(Deep.equal(newValueRef, { moo: 'mar' }));
  });

  it('subscribe callback is called on top-level changes', async () => {
    const store = new Store();

    // We're not testing initialization, so await possible invalidation.
    await true;

    let callbackCount = 0;
    let oldValueRef;
    let newValueRef;
    store.subscribe((oldValue, newValue) => {
      callbackCount++;
      oldValueRef = oldValue;
      newValueRef = newValue;
    });

    // Initial callback should have been fired.
    assert(store.value === undefined);
    assert(callbackCount === 1);
    assert(oldValueRef === undefined);
    assert(newValueRef === undefined);

    store.set('foo', 'bar');

    // Value is immediately updated, but callback will not have been called.
    assert(Deep.equal(store.value, { foo: 'bar' }));
    assert(callbackCount === 1);
    assert(oldValueRef === undefined);
    assert(newValueRef === undefined);

    // Awaiting a microtask will ensure that our callback is called.
    await true;
    assert(Deep.equal(store.value, { foo: 'bar' }));
    assert(callbackCount === 2);
    assert(oldValueRef === undefined);
    assert(newValueRef === store.value);
  });

  it('subscribe callback is called on nested changes', async () => {
    const store = new Store();

    // We're not testing initialization, so await possible invalidation.
    await true;

    let callbackCount = 0;
    let oldValueRef;
    let newValueRef;
    store.subscribe((oldValue, newValue) => {
      callbackCount++;
      oldValueRef = oldValue;
      newValueRef = newValue;
    });

    // Initial callback should have been fired.
    assert(store.value === undefined);
    assert(callbackCount === 1);
    assert(oldValueRef === undefined);
    assert(newValueRef === undefined);

    store.set('a.b.c.d', 'D');

    // Synchronously, nested update should occur. No callback yet.
    assert(Deep.equal(store.value, { a: { b: { c: { d: 'D' } } } }));
    assert(callbackCount === 1);
    assert(oldValueRef === undefined);
    assert(newValueRef === undefined);

    // Awaiting a microtask will ensure that our invalidation step completes.
    await true;
    assert(Deep.equal(store.value, { a: { b: { c: { d: 'D' } } } }));
    assert(callbackCount === 2);
    assert(oldValueRef === undefined);
    assert(newValueRef === store.value);
  });
});

describe('x-model', () => {
  it('should be able to has/get/set/remove its value', () => {
    const model = new XModel();
    assert(model.has() === false);
    assert(model.value === undefined);
    model.set({});
    assert(model.has() === true);
    assert(Deep.equal(model.value, {}));
    model.remove();
    assert(model.has() === false);
    assert(model.value === undefined);
  });

  it('should be able to has/get/set/remove nested values', () => {
    const model = new XModel();
    assert(model.has('a.b.c') === false);
    assert(model.get('a.b.c') === undefined);
    model.set('a.b.c', 'ABC');
    assert(Deep.equal(model.value, { a: { b: { c: 'ABC' } } }));
    assert(model.get('a.b.c') === 'ABC');
    model.remove('a.b.c');
    assert(model.has('a.b.c') === false);
    assert(model.get('a.b.c') === undefined);
  });

  it('should be able to be easily constructed/manipulated', () => {
    const model = new XModel();
    model.set('foo', 'bar');
    assert(model.get('foo') === 'bar');
  });

  it('should get oldValue in callback on subscribe', async () => {
    // This is important. Change sets in models should be considered atomic.
    // if we allow a callback in the middle of a synchronous set of changes,
    // we might get a callback that the model hasn't finished operating on.
    const model = new XModel();
    model.set('foo', 'bar');

    // Allow initial invalidation to complete.
    await true;

    let callbackCount = 0;
    let oldValueRef;
    let newValueRef;
    model.subscribe((oldValue, newValue) => {
      callbackCount++;
      oldValueRef = oldValue;
      newValueRef = newValue;
    });

    model.remove('foo');

    // We should get a callback upon connection. This allows subscribers to
    // connect whenever they want. However, we will get the latest *atomic*
    // change, so the synchronous change above will not be seen yet.
    assert(Deep.equal(model.value, {}));
    assert(callbackCount === 1);
    assert(oldValueRef === undefined);
    assert(Deep.equal(newValueRef, { foo: 'bar' }));

    model.set('moo', 'mar');

    // Awaiting our invalidation debouncer will call us back with the next
    // atomic change.
    await true;
    assert(Deep.equal(model.value, { moo: 'mar' }));
    assert(callbackCount === 2);
    assert(Deep.equal(oldValueRef, { foo: 'bar' }));
    assert(Deep.equal(newValueRef, { moo: 'mar' }));
  });

  it('should not require an initial value or path', () => {
    const model = new XModel();
    model.subscribe(() => {});
    model.set('foo', 'bar');
    assert(model.get('foo') === 'bar');
  });

  it('should allow an initial value', () => {
    const initialValue = { foo: 'bar' };
    const model = new XModel({ value: initialValue });
    assert(model.get('foo') === 'bar');
  });

  it('should callback on top-level changes', async () => {
    const model = new XModel();

    // We're not testing initialization, so await possible invalidation.
    await true;

    let callbackCount = 0;
    let oldValueRef;
    let newValueRef;
    model.subscribe((oldValue, newValue) => {
      callbackCount++;
      oldValueRef = oldValue;
      newValueRef = newValue;
    });

    // Initial callback should have been fired.
    assert(model.value === undefined);
    assert(callbackCount === 1);
    assert(oldValueRef === undefined);
    assert(newValueRef === undefined);

    model.set('foo', 'bar');

    // Value is immediately updated, but callback will not have been called.
    assert(Deep.equal(model.value, { foo: 'bar' }));
    assert(callbackCount === 1);
    assert(oldValueRef === undefined);
    assert(newValueRef === undefined);

    // Awaiting a microtask will ensure that our callback is called.
    await true;
    assert(Deep.equal(model.value, { foo: 'bar' }));
    assert(callbackCount === 2);
    assert(oldValueRef === undefined);
    assert(newValueRef === model.value);
  });

  it('should callback on nested changes', async () => {
    const model = new XModel();

    // We're not testing initialization, so await possible invalidation.
    await true;

    let callbackCount = 0;
    let oldValueRef;
    let newValueRef;
    model.subscribe((oldValue, newValue) => {
      callbackCount++;
      oldValueRef = oldValue;
      newValueRef = newValue;
    });

    // Initial callback should have been fired.
    assert(model.value === undefined);
    assert(callbackCount === 1);
    assert(oldValueRef === undefined);
    assert(newValueRef === undefined);

    model.set('a.b.c.d', 'D');

    // Synchronously, nested update should occur. No callback yet.
    assert(Deep.equal(model.value, { a: { b: { c: { d: 'D' } } } }));
    assert(callbackCount === 1);
    assert(oldValueRef === undefined);
    assert(newValueRef === undefined);

    // Awaiting a microtask will ensure that our invalidation step completes.
    await true;
    assert(Deep.equal(model.value, { a: { b: { c: { d: 'D' } } } }));
    assert(callbackCount === 2);
    assert(oldValueRef === undefined);
    assert(newValueRef === model.value);
  });

  it('can set children', () => {
    const root = new XModel();
    const a = new XModel();
    const b = new XModel();

    // Check that we can set children.
    root.setChild('a', a);
    a.setChild('b', b);
    b.set('B');
    assert(root.hasChild('a') === true);
    assert(root.getChild('a') === a);
    assert(a.hasChild('b') === true);
    assert(a.getChild('b') === b);
    assert(Deep.equal(root.value, { a: { b: 'B' } }));
    assert(Deep.equal(a.value, { b: 'B' }));
    assert(b.value === 'B');
  });

  it('ensures models exist in only one tree', () => {
    const root1 = new XModel();
    const root2 = new XModel();
    const child = new XModel();
    root1.setChild('child', child);

    child.set('VALUE');
    assert(root1.hasChild('child') === true);
    assert(root1.getChild('child') === child);
    assert(root2.hasChild('child') === false);
    assert(root2.getChild('child') === null);
    assert(Deep.equal(root1.value, { child: 'VALUE' }));
    assert(root2.value === undefined);

    root2.setChild('child', child);
    assert(root1.hasChild('child') === false);
    assert(root1.getChild('child') === null);
    assert(root2.hasChild('child') === true);
    assert(root2.getChild('child') === child);
    assert(Deep.equal(root1.value, { child: 'VALUE' }));
    assert(root2.value === undefined);

    child.set('NEW VALUE');
    assert(Deep.equal(root1.value, { child: 'VALUE' }));
    assert(Deep.equal(root2.value, { child: 'NEW VALUE' }));

    root1.setChild('root2', root2);
    assert(root1.hasChild('root2') === true);
    assert(root1.getChild('root2') === root2);
    assert(root2.hasChild('child') === true);
    assert(root2.getChild('child') === child);
    assert(Deep.equal(root1.value, { child: 'VALUE' }));
    assert(root2.value === undefined);

    child.set('FINAL VALUE');
    assert(
      Deep.equal(root1.value, { child: 'VALUE', root2: { child: 'FINAL VALUE' } })
    );
    assert(Deep.equal(root2.value, { child: 'FINAL VALUE' }));
  });

  it('event bubbling works', () => {
    const root = new XModel();
    const a = new XModel();
    const b = new XModel();
    root.setChild('a', a);
    a.setChild('b', b);

    let handled;
    root.addEventListener('foo', () => {
      handled = true;
    });

    // The event will make it to the root.
    handled = false;
    b.dispatchEvent(new CustomEvent('foo', { bubbles: true, composed: true }));
    assert(handled === true);

    handled = false;
    b.dispatchEvent(new CustomEvent('foo', { bubbles: true }));
    assert(handled === false);

    handled = false;
    b.dispatchEvent(new CustomEvent('foo'));
    assert(handled === false);
  });

  it('calling stopPropagation on event will prevent bubbling', () => {
    const root = new XModel();
    const a = new XModel();
    const b = new XModel();
    root.setChild('a', a);
    a.setChild('b', b);

    const rootEvents = [];
    root.addEventListener('foo', () => {
      rootEvents.push('foo');
    });
    root.addEventListener('bar', () => {
      rootEvents.push('bar');
    });

    const aEvents = [];
    a.addEventListener('foo', evt => {
      evt.stopPropagation();
      aEvents.push('foo');
      a.dispatchEvent(new CustomEvent('bar', { bubbles: true, composed: true }));
    });

    b.dispatchEvent(new CustomEvent('foo', { bubbles: true, composed: true }));
    assert(Deep.equal(aEvents, ['foo']));
    assert(Deep.equal(rootEvents, ['bar']));
  });

  it('calling stopImmediatePropagation on event will prevent next', () => {
    const root = new XModel();
    let calledFirst = false;
    let calledSecond = false;
    let calledThird = false;
    const first = () => (calledFirst = true);
    const second = evt => {
      evt.stopImmediatePropagation();
      calledSecond = true;
    };
    const third = () => (calledThird = true);
    root.addEventListener('foo', first);
    root.addEventListener('foo', second);
    root.addEventListener('foo', third);

    root.dispatchEvent(new CustomEvent('foo'));
    assert(calledFirst === true);
    assert(calledSecond === true);
    assert(calledThird === false);
  });

  it('trying to register the same exact class twice should fail', () => {
    class MyClass extends XModel {}
    MyClass.register();

    let passed = false;
    try {
      MyClass.register();
    } catch (error) {
      passed = true;
    }
    assert(passed, 'Class was unexpectedly allowed to register twice.');
  });

  it('trying to register an invalid name should not fail', () => {
    class Minified extends XModel {}

    let passed = false;
    try {
      Minified.register();
      passed = true;
    } catch (error) {
      // Ignore.
    }
    assert(passed, 'Invalid name was not corrected and registered.');
  });

  it('trying to register two classes with the name name should not fail', () => {
    const register = () => {
      class NotUnique extends XModel {}
      NotUnique.register();
    };
    register();

    let passed = false;
    try {
      register();
      passed = true;
    } catch (error) {
      // Ignore.
    }
    assert(passed, 'Duplicate name was not corrected and registered.');
  });
});
