import { test, coverage } from '@netflix/x-test/x-test.js';

// We import this here so we can see code coverage.
import '../x-model.js';
import '../x-switch.js';
import '../x-router.js';

// Set a high bar for code coverage!
// TODO: Get these all to 100.
coverage(new URL('../x-model.js', import.meta.url).href, 100);
coverage(new URL('../x-switch.js', import.meta.url).href, 90);
coverage(new URL('../x-router.js', import.meta.url).href, 95);

test('./test-x-model.html');
test('./test-x-model-next.html');
test('./test-x-switch.html');
test('./test-x-router.html');
