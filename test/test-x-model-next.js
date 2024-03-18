import { assert, describe, it } from '@netflix/x-test/x-test.js';
import { XModel } from '../x-model.js';

// Overwrite console warn for testing so we don’t get spammed with our own
//  deprecation warnings.
const seen = new Set();
const warn = console.warn; // eslint-disable-line no-console
const localMessages = [
  'Initializing value on construction is deprecated. Set value after construction.',
  'Will return an array in the future. Use ".pathNext".',
  'Use ".key" instead of ".relativePath".',
  'Use "delete" or "deleteValue" (versus "remove").',
  'Use "hasValue" to check for top-level value existence.',
  'String-type path is deprecated. Use an array.',
  'Use "setValue" or ".value" to set top-level value.',
  'The "setChild" method is deprecated. Use "attachChild".',
  'Use "deleteValue" to delete top-level value.',
  'Use "getValue" or ".value" to get top-level value.',
  'The "deleteChild" method is deprecated. Use "detachChild".',
  'The "register" method is no longer needed. You may safely delete this call.',
];
console.warn = (...args) => { // eslint-disable-line no-console
  if (!localMessages.includes(args[0]?.message)) {
    warn(...args);
  } else {
    seen.add(args[0].message);
  }
};

const isObject = object => object instanceof Object;
const deepEqual = (a, b) => {
  if (a === b) {
    return true;
  }
  return (
    isObject(a) &&
    isObject(b) &&
    // Note, we ignore non-enumerable properties (Symbols) here.
    Object.keys(a).length === Object.keys(b).length &&
    Object.keys(a).every(key => deepEqual(a[key], b[key]))
  );
};

describe('x-model', () => {
  describe('static interface', () => {
    it('“has” method works', () => {
      assert(XModel.has(undefined, ['nope']) === false);
      assert(XModel.has(null, ['nope']) === false);
      assert(XModel.has(1, ['nope']) === false);
      assert(XModel.has(undefined, 'nope') === false);
      assert(XModel.has(null, 'nope') === false);
      assert(XModel.has(1, 'nope') === false);
      assert(XModel.has(undefined, 0) === false);
      assert(XModel.has(null, 0) === false);
      assert(XModel.has(1, 0) === false);
      assert(XModel.has({ 'a': [{ 'b': undefined }] }, ['a']) === true);
      assert(XModel.has({ 'a': [{ 'b': undefined }] }, ['a', 0]) === true);
      assert(XModel.has({ 'a': [{ 'b': undefined }] }, ['a', 0, 'b']) === true);
      assert(XModel.has({ 'a': [{ 'b': undefined }] }, ['a', 0, 'b', 'nope']) === false);
    });
    it('“delete” method works', () => {
      assert(deepEqual(XModel.delete({ a: 'a' }, 'a'), {}));
      assert(deepEqual(XModel.delete({ a: 'a' }, ['a']), {}));
      assert(XModel.delete(undefined, 'a') === undefined);
      assert(XModel.delete(undefined, ['a']) === undefined);
      assert(XModel.delete(null, ['a']) === null);
      const b = 999;
      const zero = { b };
      const a = [zero];
      const object = { a };
      assert(deepEqual(XModel.delete(object, ['a', 0, 'b']), { a: [{}] }));
      assert(deepEqual(XModel.delete(object, ['a', 0]), { a: [] }));
      assert(deepEqual(XModel.delete(object, ['a']), {}));
  
      // Deleting a value is idempotent.
      assert(XModel.delete(object, ['a', 0, 'b', 'dne']) === object);
      assert(XModel.delete(object, ['a', 0, 'b']) !== object);
      assert(XModel.delete(undefined, ['a', 0, 'b', 'c']) === undefined);
      assert(XModel.delete(null, ['a', 0, 'b', 'c']) === null);
    });
    it('“get” method works', () => {
      assert(XModel.get(undefined, ['nope']) === undefined);
      assert(XModel.get(null, ['nope']) === undefined);
      assert(XModel.get(1, ['nope']) === undefined);
      assert(XModel.get(undefined, 'nope') === undefined);
      assert(XModel.get(null, 'nope') === undefined);
      assert(XModel.get(1, 'nope') === undefined);
      const b = 999;
      const zero = { b };
      const a = [zero];
      const object = { a };
      assert(XModel.get(object, ['a']) === a);
      assert(XModel.get(object, ['a', 0]) === zero);
      assert(XModel.get(object, ['a', 0, 'b']) === b);
      assert(XModel.get(object, ['a', 0, 'b', 'nope']) === undefined);
    });
    it('“set” method works', () => {
      assert(deepEqual(XModel.set({}, 'a', []), { a: [] }));
      assert(deepEqual(XModel.set({}, ['a'], []), { a: [] }));
      assert(deepEqual(XModel.set([], [0], []), [[]]));
      assert(deepEqual(XModel.set(undefined, 'a', []), { a: [] }));
      assert(deepEqual(XModel.set(undefined, ['a'], []), { a: [] }));
      assert(deepEqual(XModel.set(null, ['a'], []), { a: [] }));
      const b = 999;
      const zero = { b };
      const a = [zero];
      const object = { a };
      assert(deepEqual(XModel.set(object, ['a', 0, 'b', 'c'], []), { a: [{ b: { c: {} } }] }));
  
      // Setting the _exact_ same value in the same place is idempotent.
      const object1 = { 'a': [{ 'b': { 'c': 'same' } }] };
      const object2 = XModel.set(object1, ['a', 0, 'b', 'c'], 'same');
      const object3 = XModel.set(object1, ['a', 0, 'b', 'c'], 'different');
      assert(object1 === object2);
      assert(object1 !== object3);
    });
    it.todo('“set” should not “just work” for nonsense input', () => {
      // TODO: It’s not exactly clear what should happen here. On one hand, this
      //  is just bad usage, but on the other hand — it’s silly to try and protect
      //  us from ourselves.
      assert(XModel.set(1, ['a'], []) === 1);
    });
    it('[deprecated] “register” does nothing and warns of deprecation', () => {
      class MyModel extends XModel {}
      MyModel.register();
    });
  });
  describe('instance interface', () => {
    it('“constructor” should not require an initial value or path', () => {
      const model = new XModel();
      model.subscribe(() => {});
      model.set('foo', 'bar');
      assert(model.get('foo') === 'bar');
    });
    it('[deprecated] “constructor” should allow an initial value', () => {
      // This is deprecated because it can lead to bizarre situations where you
      //  try and initialize a value on a child model, immediate attach it to a
      //  root… and then you have a potential conflict of state!
      const initialValue = { foo: 'bar' };
      const model = new XModel({ value: initialValue });
      assert(model.get('foo') === 'bar');
    });
    it('[deprecated] “store” getter', () => {
      const model = new XModel();
      let message = '';
      try {
        model.store();
      } catch (error) {
        message = error.message;
      }
      assert(message === 'Access to store has been removed. Use ".value" to get value.', 'Expected an error.');
    });
    it('[deprecated] “path” getter returns a string', () => {
      // This will return an array in the future.
      const a = new XModel();
      const b = new XModel();
      const c = new XModel();
      a.attachChild('b', b);
      b.attachChild('c', c);
      assert(a.path === null);
      assert(b.path === 'b');
      assert(c.path === 'b.c');
    });
    it.todo('“path” getter returns an array', () => {
      const a = new XModel();
      const b = new XModel();
      const c = new XModel();
      a.attachChild('b', b);
      b.attachChild('c', c);
      assert(deepEqual(a.path, []));
      assert(deepEqual(b.path, ['b']));
      assert(deepEqual(c.path, ['b', 'c']));
    });
    it('“pathNext” getter returns an array', () => {
      const a = new XModel();
      const b = new XModel();
      const c = new XModel();
      a.attachChild('b', b);
      b.attachChild('c', c);
      assert(deepEqual(a.pathNext, []));
      assert(deepEqual(b.pathNext, ['b']));
      assert(deepEqual(c.pathNext, ['b', 'c']));
    });
    it('[deprecated] “relativePath” getter returns model key', () => {
      // This is just going to be called “key” in the future.
      const a = new XModel();
      const b = new XModel();
      const c = new XModel();
      a.attachChild('b', b);
      b.attachChild('c', c);
      assert(a.relativePath === null);
      assert(b.relativePath === 'b');
      assert(c.relativePath === 'c');
    });
    it('“key” getter returns model key', () => {
      const a = new XModel();
      const b = new XModel();
      const c = new XModel();
      a.attachChild('b', b);
      b.attachChild('c', c);
      assert(a.key === null);
      assert(b.key === 'b');
      assert(c.key === 'c');
    });
    it('“root” getter returns root of model tree', () => {
      const a = new XModel();
      const b = new XModel();
      const c = new XModel();
      a.attachChild('b', b);
      b.attachChild('c', c);
      assert(a.root === a);
      assert(b.root === a);
      assert(c.root === a);
    });
    it('“parent” getter returns direct parent of model', () => {
      const a = new XModel();
      const b = new XModel();
      const c = new XModel();
      a.attachChild('b', b);
      b.attachChild('c', c);
      assert(a.parent === null);
      assert(b.parent === a);
      assert(c.parent === b);
    });
    it('“value” getter / setter works', () => {
      const model = new XModel();
      assert(model.value === undefined);
      model.value = 'something';
      const value = model.value;
      assert(value === 'something');
    });
    it('“hasValue” / “deleteValue” works', () => {
      const model = new XModel();
      assert(!model.hasValue());
      model.setValue(undefined);
      assert(model.hasValue());
      model.deleteValue();
      assert(!model.hasValue());

      const child = new XModel();
      model.attachChild('child', child);
      assert(!child.hasValue());
      child.setValue(undefined);
      assert(child.hasValue());
      child.deleteValue();
      assert(!child.hasValue());
    });
    it('“getValue” / “setValue” works', () => {
      const model = new XModel();
      assert(model.getValue() === undefined);
      model.setValue('something');
      const value = model.getValue();
      assert(value === 'something');

      const child = new XModel();
      model.attachChild('child', child);
      assert(child.getValue() === undefined);
      child.setValue('something');
      const childValue = child.getValue();
      assert(childValue === 'something');
    });
    it('[deprecated] pathless “has” / “delete” warns', () => {
      const model = new XModel();
      assert(!model.has()); // Note that we aren’t passing in a path here.
      model.set('something'); // Note that we aren’t passing in a path here.
      assert(model.has()); // Note that we aren’t passing in a path here.
      model.delete(); // Note that we aren’t passing in a path here.
      assert(!model.has()); // Note that we aren’t passing in a path here.
    });
    it('top “has” / “delete” via simple path works', () => {
      const model = new XModel();
      const path = 'foo'; // Note that this is just a simple string.
      assert(!model.has(path));
      model.set(path, 'something');
      assert(model.has(path));
      model.delete(path);
      assert(!model.has(path));

      const child = new XModel();
      model.attachChild('child', child);
      assert(!child.has(path));
      child.set(path, 'something');
      assert(child.has(path));
      child.delete(path);
      assert(!child.has(path));
    });
    it('top “has” / “delete” via path works', () => {
      const model = new XModel();
      const path = ['foo']; // Note that this is a standard path array.
      assert(!model.has(path));
      model.set(path, 'something');
      assert(model.has(path));
      model.delete(path);
      assert(!model.has(path));

      const child = new XModel();
      model.attachChild('child', child);
      assert(!child.has(path));
      child.set(path, 'something');
      assert(child.has(path));
      child.delete(path);
      assert(!child.has(path));
    });
    it('deep “has” / “delete” via path works', () => {
      const model = new XModel();
      const path = [999, 'b.a.r', 'baz'];
      assert(!model.has(path));
      model.set(path, 'something');
      assert(model.has(path));
      model.delete(path);
      assert(!model.has(path));

      const child = new XModel();
      model.attachChild('child', child);
      assert(!child.has(path));
      child.set(path, 'something');
      assert(child.has(path));
      child.delete(path);
      assert(!child.has(path));
    });
    it('[deprecated] pathless “get” / “set” warns', () => {
      const model = new XModel();
      assert(!model.get()); // Note that we aren’t passing in a path here.
      model.set('something'); // Note that we aren’t passing in a path here.
      assert(model.get()); // Note that we aren’t passing in a path here.
      model.delete(); // Note that we aren’t passing in a path here.
      assert(!model.get()); // Note that we aren’t passing in a path here.
    });
    it('top “get” / “set” via simple path works', () => {
      const model = new XModel();
      const path = 'foo';
      assert(model.get(path) === undefined);
      let something = model.get(path);
      assert(something === undefined);
      model.set(path, 'something');
      something = model.get(path);
      assert(something === 'something');
      model.set(path, 'something-else');
      something = model.get(path);
      assert(something === 'something-else');

      const child = new XModel();
      model.attachChild('child', child);
      something = child.get(path);
      assert(child.get(path) === undefined);
      assert(something === undefined);
      child.set(path, 'something');
      something = child.get(path);
      assert(something === 'something');
      child.set(path, 'something-else');
      something = child.get(path);
      assert(something === 'something-else');
    });
    it('top “get” / “set” via path works', () => {
      const model = new XModel();
      const path = ['foo'];
      assert(model.get(path) === undefined);
      let something = model.get(path);
      assert(something === undefined);
      model.set(path, 'something');
      something = model.get(path);
      assert(something === 'something');
      model.set(path, 'something-else');
      something = model.get(path);
      assert(something === 'something-else');

      const child = new XModel();
      model.attachChild('child', child);
      assert(child.get(path) === undefined);
      something = child.get(path);
      assert(something === undefined);
      child.set(path, 'something');
      something = child.get(path);
      assert(something === 'something');
      child.set(path, 'something-else');
      something = child.get(path);
      assert(something === 'something-else');
    });
    it('[deprecated] pathless “remove” works', () => {
      const model = new XModel();
      assert(model.has() === false); // Note that we aren’t passing in a path here.
      assert(model.get() === undefined); // Note that we aren’t passing in a path here.
      model.set('ABC'); // Note that we aren’t passing in a path here.
      assert(model.value, 'ABC');
      assert(model.get() === 'ABC'); // Note that we aren’t passing in a path here.
      model.remove(); // Note that we aren’t passing in a path here.
      assert(model.has() === false); // Note that we aren’t passing in a path here.
      assert(model.get() === undefined); // Note that we aren’t passing in a path here.
    });
    it('[deprecated] “remove” works', () => {
      const model = new XModel();
      assert(model.has('a.0.b.c') === false);
      assert(model.get('a.0.b.c') === undefined);
      model.set('a.0.b.c', 'ABC');
      assert(deepEqual(model.value, { a: [{ b: { c: 'ABC' } }] }));
      assert(model.get('a.0.b.c') === 'ABC');
      model.remove('a.0.b.c');
      assert(model.has('a.0.b.c') === false);
      assert(model.get('a.0.b.c') === undefined);
    });
    it('throws if “subscribe” is not a function', () => {
      const expectedMessage = 'Subscribe callback must be a Function.';
      let message = 'no message thrown';
      const model = new XModel();
      try {
        model.subscribe();
      } catch (error) {
        message = error.message;
      }
      assert(message === expectedMessage, message);
    });
    it('“subscribe” provides expected interface', async () => {
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
  
      model.delete('foo');
  
      // We should get a callback upon connection. This allows subscribers to
      // connect whenever they want. However, we will get the latest *atomic*
      // change, so the synchronous change above will not be seen yet.
      assert(deepEqual(model.value, {}));
      assert(callbackCount === 1);
      assert(oldValueRef === undefined);
      assert(deepEqual(newValueRef, { foo: 'bar' }));
  
      model.set('moo', 'mar');
  
      // Awaiting our invalidation debouncer will call us back with the next
      // atomic change.
      await true;
      assert(deepEqual(model.value, { moo: 'mar' }));
      assert(callbackCount === 2);
      assert(deepEqual(oldValueRef, { foo: 'bar' }));
      assert(deepEqual(newValueRef, { moo: 'mar' }));
    });
    it('“subscribe” should callback on top-level changes', async () => {
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
  
      model.set(['foo'], 'bar');
  
      // Value is immediately updated, but callback will not have been called.
      assert(deepEqual(model.value, { foo: 'bar' }));
      assert(callbackCount === 1);
      assert(oldValueRef === undefined);
      assert(newValueRef === undefined);
  
      // Awaiting a microtask will ensure that our callback is called.
      await true;
      assert(deepEqual(model.value, { foo: 'bar' }));
      assert(callbackCount === 2);
      assert(oldValueRef === undefined);
      assert(newValueRef === model.value);
    });
    it('“subscribe” should callback on nested changes', async () => {
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
      assert(deepEqual(model.value, { a: { b: { c: { d: 'D' } } } }));
      assert(callbackCount === 1);
      assert(oldValueRef === undefined);
      assert(newValueRef === undefined);
  
      // Awaiting a microtask will ensure that our invalidation step completes.
      await true;
      assert(deepEqual(model.value, { a: { b: { c: { d: 'D' } } } }));
      assert(callbackCount === 2);
      assert(oldValueRef === undefined);
      assert(newValueRef === model.value);
    });
    it('“isRoot” correctly identifies if model is the root', () => {
      const a = new XModel();
      const b = new XModel();
      const c = new XModel();
      a.attachChild('b', b);
      b.attachChild('c', c);
      assert(a.isRoot() === true);
      assert(b.isRoot() === false);
      assert(c.isRoot() === false);
    });
    it('[deprecated] “resolvePath” resolves a local path to the full path', () => {
      // This will be deleted in the future.
      const a = new XModel();
      const b = new XModel();
      const c = new XModel();
      a.attachChild('b', b);
      b.attachChild('c', c);
      assert(a.resolvePath('foo') === 'foo');
      assert(b.resolvePath('foo') === 'b.foo');
      assert(c.resolvePath('foo') === 'b.c.foo');
    });
    it('“hasChild” throws if given non-string key', () => {
      const expectedMessage = 'Child keys must be strings.';
      let message = 'no error was thrown';
      const model = new XModel();
      try {
        model.hasChild(1);
      } catch (error) {
        message = error.message;
      }
      assert(message === expectedMessage, message);
    });
    it('“getChild” throws if given non-string key', () => {
      const expectedMessage = 'Child keys must be strings.';
      let message = 'no error was thrown';
      const model = new XModel();
      try {
        model.getChild(1);
      } catch (error) {
        message = error.message;
      }
      assert(message === expectedMessage, message);
    });
    it('[deprecated] “setChild” / “deleteChild” still work for now', () => {
      // This will be deleted.
      const root = new XModel();
      const a = new XModel();
      assert(root.hasChild('a') === false);
      root.setChild('a', a);
      assert(root.hasChild('a') === true);
      root.deleteChild('a');
      assert(root.hasChild('a') === false);
    });
    it('“attachChild” throws if given non-string key', () => {
      const expectedMessage = 'Child keys must be strings.';
      let message = 'no error was thrown';
      const model = new XModel();
      try {
        model.attachChild(1, new XModel());
      } catch (error) {
        message = error.message;
      }
      assert(message === expectedMessage, message);
    });
    it('“attachChild” throws if given non-x-model child', () => {
      const expectedMessage = 'Child must inherit from "XModel".';
      let message = 'no error was thrown';
      const model = new XModel();
      try {
        model.attachChild('foo', null);
      } catch (error) {
        message = error.message;
      }
      assert(message === expectedMessage, message);
    });
    it('“detachChild” throws if given non-string key', () => {
      const expectedMessage = 'Child keys must be strings.';
      let message = 'no error was thrown';
      const model = new XModel();
      try {
        model.detachChild(1);
      } catch (error) {
        message = error.message;
      }
      assert(message === expectedMessage, message);
    });
    it('“attach” throws if given non-string key', () => {
      const expectedMessage = 'Child keys must be strings.';
      let message = 'no error was thrown';
      const model = new XModel();
      try {
        model.attach(1, new XModel());
      } catch (error) {
        message = error.message;
      }
      assert(message === expectedMessage, message);
    });
    it('“attach” throws if given non-x-model parent', () => {
      const expectedMessage = 'Parent must inherit from "XModel".';
      let message = 'no error was thrown';
      const model = new XModel();
      try {
        model.attach('foo', null);
      } catch (error) {
        message = error.message;
      }
      assert(message === expectedMessage, message);
    });
    it('“hasChild” / “attachChild” works', () => {
      const root = new XModel();
      const a = new XModel();
      assert(root.hasChild('a') === false);
      root.attachChild('a', a);
      assert(root.hasChild('a') === true);
      root.detachChild('a');
      assert(root.hasChild('a') === false);
    });
    it('“attach” / “attachChild” / “detach” / “detachChild” works', () => {
      const root = new XModel();
      const a = new XModel();
      const b = new XModel();

      // Check that we can attach children.
      a.attach('a', root);
      a.attachChild('b', b);
      b.setValue('B');
      assert(root.hasChild('a') === true);
      assert(root.getChild('a') === a);
      assert(a.hasChild('b') === true);
      assert(a.getChild('b') === b);
      assert(deepEqual(root.value, { a: { b: 'B' } }));
      assert(deepEqual(a.value, { b: 'B' }));
      assert(b.value === 'B');
      root.detachChild('a');
      assert(root.hasChild('a') === false);
      assert(root.getChild('a') === null);
      assert(a.hasChild('b') === true);
      assert(a.getChild('b') === b);
      assert(deepEqual(root.value, { a: { b: 'B' } }));
      assert(deepEqual(a.value, undefined));
      b.detach();
      assert(root.hasChild('a') === false);
      assert(root.getChild('a') === null);
      assert(a.hasChild('b') === false);
      assert(a.getChild('b') === null);
      assert(deepEqual(root.value, { a: { b: 'B' } }));
      assert(deepEqual(a.value, undefined));
    });
    it('ensures models exist in only one tree', () => {
      const root1 = new XModel();
      const root2 = new XModel();
      const child = new XModel();
      root1.attachChild('child', child);

      child.setValue('VALUE');
      assert(root1.hasChild('child') === true);
      assert(root1.getChild('child') === child);
      assert(root2.hasChild('child') === false);
      assert(root2.getChild('child') === null);
      assert(deepEqual(root1.getValue(), { child: 'VALUE' }));
      assert(root2.getValue() === undefined);

      root2.attachChild('child', child);
      assert(root1.hasChild('child') === false);
      assert(root1.getChild('child') === null);
      assert(root2.hasChild('child') === true);
      assert(root2.getChild('child') === child);
      assert(deepEqual(root1.getValue(), { child: 'VALUE' }));
      assert(root2.getValue() === undefined);

      child.setValue('NEW VALUE');
      assert(deepEqual(root1.getValue(), { child: 'VALUE' }));
      assert(deepEqual(root2.getValue(), { child: 'NEW VALUE' }));

      root1.attachChild('root2', root2);
      assert(root1.hasChild('root2') === true);
      assert(root1.getChild('root2') === root2);
      assert(root2.hasChild('child') === true);
      assert(root2.getChild('child') === child);
      assert(deepEqual(root1.getValue(), { child: 'VALUE' }));
      assert(root2.getValue() === undefined);

      child.setValue('FINAL VALUE');
      assert(deepEqual(root1.getValue(), { child: 'VALUE', root2: { child: 'FINAL VALUE' } }));
      assert(deepEqual(root2.getValue(), { child: 'FINAL VALUE' }));
    });
    it('“addEventListener” throws if “type” is not a string', () => {
      const expectedMessage = 'Expected "type" argument to be a "string".';
      let message = 'no error thrown';
      const model = new XModel();
      try {
        model.addEventListener(1, () => {});
      } catch (error) {
        message = error.message;
      }
      assert(message === expectedMessage, message);
    });
    it('“addEventListener” throws if “callback” is not a string', () => {
      const expectedMessage = 'Expected "callback" argument to be a "function".';
      let message = 'no error thrown';
      const model = new XModel();
      try {
        model.addEventListener('click', 'fun!');
      } catch (error) {
        message = error.message;
      }
      assert(message === expectedMessage, message);
    });
    it('“addEventListener” throws if caller attempts to pass third argument', () => {
      const expectedMessage = 'Expected exactly two arguments.';
      let message = 'no error thrown';
      const model = new XModel();
      try {
        model.addEventListener('click', () => {}, { capture: true });
      } catch (error) {
        message = error.message;
      }
      assert(message === expectedMessage, message);
    });
    it('“removeEventListener” throws if “type” is not a string', () => {
      const expectedMessage = 'Expected "type" argument to be a "string".';
      let message = 'no error thrown';
      const model = new XModel();
      try {
        model.removeEventListener(1, () => {});
      } catch (error) {
        message = error.message;
      }
      assert(message === expectedMessage, message);
    });
    it('“removeEventListener” throws if “callback” is not a string', () => {
      const expectedMessage = 'Expected "callback" argument to be a "function".';
      let message = 'no error thrown';
      const model = new XModel();
      try {
        model.removeEventListener('click', 'fun!');
      } catch (error) {
        message = error.message;
      }
      assert(message === expectedMessage, message);
    });
    it('“removeEventListener” throws if caller attempts to pass third argument', () => {
      const expectedMessage = 'Expected exactly two arguments.';
      let message = 'no error thrown';
      const model = new XModel();
      try {
        model.removeEventListener('click', () => {}, { capture: true });
      } catch (error) {
        message = error.message;
      }
      assert(message === expectedMessage, message);
    });
    it('attempting to access “composedPath” will throw', () => {
      const expectedMessage = 'The composedPath method is not yet supported.';
      let message = 'no error thrown';
      const model = new XModel();
      const type = 'foo';
      const callback = event => {
        try {
          event.composedPath();
        } catch (error) {
          message = error.message;
        }
      };
      model.addEventListener(type, callback);
      model.dispatchEvent(new CustomEvent(type));
      assert(message === expectedMessage, message);
    });
    it('“addEventListener” / “removeEventListener” work', () => {
      const model = new XModel();
      let count = 0;
      const type = 'foo';
      const callback = () => { count++; };
      model.addEventListener(type, callback);
      assert(count === 0);
      model.dispatchEvent(new CustomEvent(type));
      assert(count === 1);
      model.dispatchEvent(new CustomEvent(type));
      assert(count === 2);
      model.removeEventListener(type, callback);
      model.dispatchEvent(new CustomEvent(type));
      assert(count === 2);
      model.removeEventListener(type, callback); // Second remove should not throw.
      assert(count === 2);
    });
    it('accessing event “target” works', () => {
      const model = new XModel();
      let target = null;
      const type = 'foo';
      const callback = event => { target = event.target; };
      model.addEventListener(type, callback);
      model.dispatchEvent(new CustomEvent(type));
      assert(target === model, 'target was not correctly provided in event');
    });
    it('accessing event “currentTarget” works', () => {
      const model = new XModel();
      let currentTarget = null;
      const type = 'foo';
      const callback = event => { currentTarget = event.currentTarget; };
      model.addEventListener(type, callback);
      model.dispatchEvent(new CustomEvent(type));
      assert(currentTarget === model, 'target was not correctly provided in event');
    });
    it('event bubbling works', () => {
      const root = new XModel();
      const a = new XModel();
      const b = new XModel();
      root.attachChild('a', a);
      a.attachChild('b', b);
  
      let handled;
      root.addEventListener('foo', () => { handled = true; });
  
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
      root.attachChild('a', a);
      a.attachChild('b', b);

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
      assert(deepEqual(aEvents, ['foo']));
      assert(deepEqual(rootEvents, ['bar']));
    });
    it('calling stopImmediatePropagation on event will prevent next', () => {
      const root = new XModel();
      let calledFirst = false;
      let calledSecond = false;
      let calledThird = false;
      const first = () => { calledFirst = true; };
      const second = evt => {
        evt.stopImmediatePropagation();
        calledSecond = true;
      };
      const third = () => { calledThird = true; };
      root.addEventListener('foo', first);
      root.addEventListener('foo', second);
      root.addEventListener('foo', third);

      root.dispatchEvent(new CustomEvent('foo'));
      assert(calledFirst === true);
      assert(calledSecond === true);
      assert(calledThird === false);
    });
  });
});

it('confirm that deprecation warnings are still necessary', () => {
  for (const message of localMessages) {
    assert(seen.has(message), `Unused deprecation warning: ${message}`);
  }
});
