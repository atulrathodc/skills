---
name: static-frontend
description: Build and run a plain HTML/CSS/JS frontend — no framework, no build step, serve statically, fetch the API.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# Static Frontend

The universal fallback: plain HTML/CSS/JS with no framework and no build step.

1. **Structure** — `index.html`, `styles.css`, `app.js` (or `public/` served directly). Load `app.js` with `<script defer src="app.js">` and `styles.css` with `<link rel="stylesheet">`.
2. **Serve it** — any static server works: `python3 -m http.server <port>`, `npx serve`, or the backend serving `public/`. No build needed (see `make-it-run`).
3. **API calls** — `fetch('/api/...')` in `app.js`; render with `document.createElement` / `innerHTML` or `insertAdjacentHTML`. Handle `fetch` errors and `res.ok === false`.
4. **CORS** — if the frontend is on one origin and the API on another, the API must allow it or a dev proxy must sit in front (see `frontend-backend-integration`).
5. **Absolute paths** — always `./assets/...` or root-relative `/assets/...` — never `file://` paths; a page that "works when opened" but 404s when served is a relative-path bug.
6. **Verify** — curl the page (200 + the HTML references the right CSS/JS), then curl an API call from the page (see `ui-verification`, `http-api-testing`).
