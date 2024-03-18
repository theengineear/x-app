import { assert, describe, it } from '@netflix/x-test/x-test.js';
import { XModel } from '../x-model.js';

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
    it('“register” now throws an error', () => {
      class MyModel extends XModel {}
      let message;
      try {
        MyModel.register();
      } catch (error) {
        message = error.message;
      }
      assert(message === 'The "register" method is no longer needed. You may safely delete this call.', 'No error thrown.');
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
  describe('[deprecated] prior interface', () => {
    class Deep {
      static equal(a, b) {
        return deepEqual(a, b);
      }
    }
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
    it.skip('trying to register the same exact class twice should fail', () => {
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
    it.skip('trying to register an invalid name should not fail', () => {
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
    it.skip('trying to register two classes with the name name should not fail', () => {
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
});
