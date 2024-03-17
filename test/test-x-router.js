import { XRouter } from '../x-router.js';
import { assert, it } from '@netflix/x-test/x-test.js';

// Router is a singleton whose values may not be redefined. Therefore we set it
// up once at the beginning of this test.
const originalUrl = new URL(location);
const counts = { slash: 0, fooId: 0, fooBar: 0, wildcard: 0 };
const calls = {};
XRouter.set('/', () => ++counts.slash);
XRouter.set('/foo/:fooId', () => ++counts.fooId);
// We put /foo/bar last to prove we prioritize literal matches.
XRouter.set('/foo/bar', () => ++counts.fooBar);
XRouter.set('/foo/:fooId/bar/:barId', (...args) => (calls.fooIdBarId = args));
XRouter.set('*', (...args) => ++counts.wildcard && (calls.wildcard = args));

it('parses "/"', () => {
  const actual = XRouter.parse('/');
  assert(`${actual.regex}` === '/^\\/$/');
  assert(`${actual.tokens}` === '');
});

it('parses "/foo"', () => {
  const actual = XRouter.parse('/foo');
  assert(`${actual.regex}` === '/^\\/foo$/');
  assert(`${actual.tokens}` === '');
});

it('parses "/foo/bar"', () => {
  const actual = XRouter.parse('/foo/bar');
  assert(`${actual.regex}` === '/^\\/foo\\/bar$/');
  assert(`${actual.tokens}` === '');
});

it('parses "/foo/:fooId"', () => {
  const actual = XRouter.parse('/foo/:fooId');
  assert(`${actual.regex}` === '/^\\/foo\\/([^/^?^#]+)$/');
  assert(`${actual.tokens}` === 'fooId');
});

it('parses "/foo/:fooId/bar"', () => {
  const actual = XRouter.parse('/foo/:fooId/bar');
  assert(`${actual.regex}` === '/^\\/foo\\/([^/^?^#]+)\\/bar$/');
  assert(`${actual.tokens}` === 'fooId');
});

it('parses "/foo/:fooId/bar/:barId"', () => {
  const actual = XRouter.parse('/foo/:fooId/bar/:barId');
  assert(`${actual.regex}` === '/^\\/foo\\/([^/^?^#]+)\\/bar\\/([^/^?^#]+)$/');
  assert(`${actual.tokens}` === 'fooId,barId');
});

it('parses "/foo/:fooId+"', () => {
  const actual = XRouter.parse('/foo/:fooId+');
  assert(`${actual.regex}` === '/^\\/foo\\/([^?^#]+)$/');
  assert(`${actual.tokens}` === 'fooId');
});

it('parses "/foo/:fooId+/bar/:barId+"', () => {
  const actual = XRouter.parse('/foo/:fooId+/bar/:barId+');
  assert(`${actual.regex}` === '/^\\/foo\\/([^?^#]+)\\/bar\\/([^?^#]+)$/');
  assert(`${actual.tokens}` === 'fooId,barId');
});

it('parse throws for ambiguous params', () => {
  let passed = false;
  try {
    XRouter.parse('/foo/:id/bar/:id');
  } catch (err) {
    if (err.message === 'Ambiguous parameter name "id"') {
      passed = true;
    }
  }
  assert(passed);
});

it('resolve returns a url for a same-origin click', () => {
  let passed = false;
  const href = new URL('/foo/bar', location).href;
  const a = document.createElement('a');
  a.href = href;
  const onClick = evt => {
    evt.preventDefault();
    const url = XRouter.resolve(evt);
    passed = url && url.href === href;
  };
  a.addEventListener('click', onClick, { once: true });
  a.click();
  assert(passed);
});

it('resolve returns url for same-origin, target="_self" click', () => {
  let passed = false;
  const href = new URL('/foo/bar', location).href;
  const a = document.createElement('a');
  a.href = href;
  a.target = '_self';
  const onClick = evt => {
    evt.preventDefault();
    const url = XRouter.resolve(evt);
    passed = url && url.href === href;
  };
  a.addEventListener('click', onClick, { once: true });
  a.click();
  assert(passed);
});

it('resolve returns undefined if pattern is not recognized', () => {
  let passed = false;
  const href = new URL('/dne', location).href;
  const a = document.createElement('a');
  a.href = href;
  const onClick = evt => {
    evt.preventDefault();
    const url = XRouter.resolve(evt);
    passed = url === undefined;
  };
  a.addEventListener('click', onClick, { once: true });
  a.click();
  assert(passed);
});

it('resolve returns undefined for a same-origin target="_blank" click', () => {
  let passed = false;
  const href = new URL('/foo/bar', location).href;
  const a = document.createElement('a');
  a.href = href;
  a.target = '_blank';
  const onClick = evt => {
    evt.preventDefault();
    const url = XRouter.resolve(evt);
    passed = url === undefined;
  };
  a.addEventListener('click', onClick, { once: true });
  a.click();
  assert(passed);
});

it('resolve returns undefined for a cross-origin click', () => {
  let passed = false;
  const href = 'https://example.com/foo/bar';
  const a = document.createElement('a');
  a.href = href;
  const onClick = evt => {
    evt.preventDefault();
    const url = XRouter.resolve(evt);
    passed = url === undefined;
  };
  a.addEventListener('click', onClick, { once: true });
  a.click();
  assert(passed);
});

it('resolve returns undefined when not an "a" tag', () => {
  let passed = false;
  const href = new URL('/foo/bar', location).href;
  const div = document.createElement('div');
  div.href = href;
  const onClick = evt => {
    evt.preventDefault();
    const url = XRouter.resolve(evt);
    passed = url === undefined;
  };
  div.addEventListener('click', onClick, { once: true });
  div.click();
  assert(passed);
});

it('resolve returns undefined when shiftKey is true', () => {
  let passed = false;
  const href = new URL('/foo/bar', location).href;
  const a = document.createElement('a');
  a.href = href;
  const onClick = evt => {
    evt.preventDefault();
    const url = XRouter.resolve(evt);
    passed = url === undefined;
  };
  a.addEventListener('click', onClick);
  a.dispatchEvent(
    new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      shiftKey: true,
    })
  );
  assert(passed);
});

it('resolve returns undefined when ctrlKey is true', () => {
  let passed = false;
  const href = new URL('/foo/bar', location).href;
  const a = document.createElement('a');
  a.href = href;
  const onClick = evt => {
    evt.preventDefault();
    const url = XRouter.resolve(evt);
    passed = url === undefined;
  };
  a.addEventListener('click', onClick);
  a.dispatchEvent(
    new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      ctrlKey: true,
    })
  );
  assert(passed);
});

it('resolve returns undefined when metaKey is true', () => {
  let passed = false;
  const href = new URL('/foo/bar', location).href;
  const a = document.createElement('a');
  a.href = href;
  const onClick = evt => {
    evt.preventDefault();
    const url = XRouter.resolve(evt);
    passed = url === undefined;
  };
  a.addEventListener('click', onClick);
  a.dispatchEvent(
    new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      metaKey: true,
    })
  );
  assert(passed);
});

it('resolve returns undefined when altKey is true', () => {
  let passed = false;
  const href = new URL('/foo/bar', location).href;
  const a = document.createElement('a');
  a.href = href;
  const onClick = evt => {
    evt.preventDefault();
    const url = XRouter.resolve(evt);
    passed = url === undefined;
  };
  a.addEventListener('click', onClick);
  a.dispatchEvent(
    new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      altKey: true,
    })
  );
  assert(passed);
});

it('calls correct callback', async () => {
  const slashUrl = new URL('/', location);
  const fooIdUrl = new URL('/foo/baz', location);
  const fooBarUrl = new URL('/foo/bar', location);
  const wildcardUrl = new URL('/dne', location);

  history.replaceState(null, null, slashUrl);
  XRouter.read();
  assert(counts.slash === 1);
  assert(counts.fooId === 0);
  assert(counts.fooBar === 0);
  assert(counts.wildcard === 0);

  history.replaceState(null, null, fooIdUrl);
  XRouter.read();
  assert(counts.slash === 1);
  assert(counts.fooId === 1);
  assert(counts.fooBar === 0);
  assert(counts.wildcard === 0);

  history.replaceState(null, null, fooBarUrl);
  XRouter.read();
  assert(counts.slash === 1);
  assert(counts.fooId === 1);
  assert(counts.fooBar === 1);
  assert(counts.wildcard === 0);

  history.replaceState(null, null, wildcardUrl);
  XRouter.read();
  assert(counts.slash === 1);
  assert(counts.fooId === 1);
  assert(counts.fooBar === 1);
  assert(counts.wildcard === 1);

  history.replaceState(null, null, originalUrl);
});

it('passes correct arguments to callback', () => {
  const normalUrl = new URL('/foo/1/bar/2', location);
  const wildcardUrl = new URL('/dne', location);

  history.replaceState(null, null, normalUrl);
  XRouter.read();
  history.replaceState(null, null, wildcardUrl);
  XRouter.read();
  assert(calls.fooIdBarId);
  assert(calls.wildcard);
  assert(calls.fooIdBarId[0].href === normalUrl.href);
  assert(calls.fooIdBarId[1].size === 2);
  assert(calls.fooIdBarId[1].get('fooId') === '1');
  assert(calls.fooIdBarId[1].get('barId') === '2');
  assert(calls.wildcard[0].href === wildcardUrl.href);
  assert(calls.wildcard[1].size === 0);

  history.replaceState(null, null, originalUrl);
});
