# Things to TODO

- Make `npm test` run all our tests.
- Remove the need to depend on “x-element” from our test suite.
- CONSIDER removing “x-element” dependency from this repo.
- ^^ Could we instead have _yet another_ repository that’s an example app?
  That’s where we could have `x-todo-mvc` or some such. Then, we could have a
  hyper-simple.
- TODO: Can we omit the “validity” check from x-switch?
- Get demo to install deps on start.
- Add demo for x-switch.
- Add demo for x-router.
- Add demo for x-model.
- Do we need to have an x-app file? It may be useful for setting things like
  the “font-family” defaults etc. Also, there is a FOUC on demo pages that use
  a _link_ versus static imports — should fix that.
- Should we make the “demo” >> “example” or something?
  Then, we could set up `/x-style/demo/` and `/x-style/x-style.js`, etc.
- Write README.md — i.e., ~philosophize~.
- Should we do anything about test output from failed lookups for both
  a “favicon.ico” file and a “service-worker.js” file? Seems that favicon is
  the only issue. Should we pick / make a real one?
- Bump up coverage requirements to 100% in our tests.
