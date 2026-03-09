# Ravionus

Developer tools, interactive learning, and code playgrounds — all client-side at [ravionus.com](https://ravionus.com).

## Structure
```
index.html              ← landing page
CNAME                   ← custom domain for GitHub Pages

tools/                  ← developer utility tools
  index.html            ← tools listing page
  base64/index.html     ← Base64 encoder/decoder
  csv/index.html        ← CSV ↔ JSON converter
  formatter/index.html  ← Code formatter (JS, HTML, CSS, JSON)
  hash/index.html       ← Hash generator (MD5, SHA-1/256/384/512)
  json/index.html       ← JSON formatter & validator
  regex/index.html      ← Regex tester
  url/index.html        ← URL encoder/decoder & parser
  yaml/index.html       ← YAML validator & converter

playground/             ← interactive playgrounds
  index.html            ← playgrounds listing page
  markdown/index.html   ← Markdown preview with live rendering

learn/                  ← interactive learning platform
  index.html            ← topic catalog
  topic.html            ← lesson reader + quiz engine
  style.css             ← design system
  app.js                ← quiz engine & progress tracking
  content.js            ← all course content (edit this to add topics)
  certificate.js        ← completion certificate generator
  firebase.js           ← Firebase auth & cloud sync
  auth-test.html        ← minimal auth test page

tests/                  ← Playwright end-to-end tests
  *.spec.js             ← test files (base64, catalog, csv, formatter,
                           hash, json, markdown, regex, topic, url, yaml)
  playwright.config.js  ← test configuration
```

## Adding a new topic
Edit `learn/content.js` — add one object to the `TOPICS` array.

## Running tests
```bash
cd tests
npx playwright test
```

## Deployed via
GitHub Pages + Dynadot custom domain
