import { XRouter } from '../../x-router.js';

const file = import.meta.url;
const pwd = file.slice(0, file.lastIndexOf('/'));
const base = pwd.replace(location.origin, '');

const title = 'My Application';

// Setup routes.
XRouter.set(`${base}/`, () => {
  document.title = title;
});
XRouter.set(`${base}/page1`, () => {
  document.title = `Page 1 \u2022 ${title}`;
});
XRouter.set(`${base}/page2`, () => {
  document.title = `Page 2 \u2022 ${title}`;
});
XRouter.set(`${base}/page3/:bar/baz/:bazinga`, (url, params) => {
  document.title = `Page 3 (${params.get('bazinga')}) \u2022 ${title}`;
});
XRouter.set('*', () => {
  console.error('No matching route.'); // eslint-disable-line no-console
});

// Setup listeners.
window.addEventListener('load', () => {
  XRouter.read();
});
window.addEventListener('popstate', () => {
  XRouter.read();
});
window.addEventListener('hashchange', () => {
  XRouter.read();
});
window.addEventListener('click', event => {
  const url = XRouter.resolve(event);
  if (url) {
    event.preventDefault();
    history.pushState({}, null, url);
    XRouter.read();
  }
});


/**
 * Must generate links based on the mount point of this web page. Generally we use absolute relative paths to simplify this in production
 */

const makeLink = (path, label) => {
  const item = document.createElement('li');
  const link = document.createElement('a');
  link.href = `${base}${path}`;
  link.innerText = label;
  item.appendChild(link);
  return item;
};

const frag = new DocumentFragment();
const list = document.createElement('ul');
frag.appendChild(list);
frag.appendChild(makeLink('/', 'Home'));
frag.appendChild(makeLink('/page1', 'Page 1'));
frag.appendChild(makeLink('/page2', 'Page 2'));
frag.appendChild(makeLink('/page3/1/baz/a', 'Page 3'));
frag.appendChild(makeLink('/../../..', 'Not in SPA'));

document.getElementById('header').appendChild(frag);
