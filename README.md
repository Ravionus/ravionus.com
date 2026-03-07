# Ravionus Learn 

Interactive learning platform at [ravionus.com/learn](https://ravionus.com/learn).

## Structure
```
learn/          ← all site files here
  index.html    ← topic catalog
  topic.html    ← lesson reader + quiz engine
  style.css     ← design system
  app.js        ← quiz engine & progress tracking
  content.js    ← ★ all course content (edit this to add topics)
index.html      ← root redirect to /learn/
CNAME           ← custom domain for GitHub Pages
```

## Adding a new topic
Edit `learn/content.js` — add one object to the `TOPICS` array. That's it.

## Deployed via
GitHub Pages + Dynadot custom domain
