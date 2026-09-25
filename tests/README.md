# Test harness

DOM tests (jsdom) and mobile audits (puppeteer-core with system Chrome).

```bash
cd tests
npm install jsdom puppeteer-core
node dom.test.js       # 45 functional tests
node mobile-audit.js   # layout metrics at 390px (header 65px, no overflow expected)
node overlap-audit.js  # text overlap detection at 320/360/393/430px
```

`mobile-audit.js` and `overlap-audit.js` need a local server on port 8765:
`python3 -m http.server 8765` from the repo root, and system Chrome at
/Applications/Google Chrome.app.

Notes:
- jsdom has no `matchMedia` — the harness polyfills it (always false).
- Page scripts are eval'd concatenated (top-level `const` doesn't share
  scope between separate `window.eval` calls).
