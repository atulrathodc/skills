---
name: ui-verification
description: Verify a RUNNING user interface actually works — page loads, key elements render, no console/network errors, and the feature round-trips.
allowed-tools: Bash, Read, Grep, Glob
---

# UI Verification

A frontend that "built" is not a working UI. Prove the running UI renders and its features work.

1. **Serve it and load it** — the frontend must be running (see `react-frontend` / `make-it-run`). `curl -s -o /dev/null -w "%{http_code}" http://localhost:<port>/` must be 200 and the HTML must reference the real bundle (`/assets/*.js`).
2. **Check the bundle loads** — curl the script/link URLs from the HTML (`<script src="...">`, `<link href="...">`). A 404 bundle = a blank page even though the server responds.
3. **Check the console/network errors** — if the framework prints them to the served log or you can run a headless browser (`gstack`/puppeteer), capture: JS errors (blank page, "X is not defined"), failed API calls (404/500), and CORS errors.
4. **Exercise the feature end-to-end** — the UI calls the backend; confirm the round-trip works through the real UI path (see `frontend-backend-integration`, `http-api-testing`).
5. **Common "blank page" causes** — wrong asset base path, missing CORS, the page calling an API that 404s, or a JS error before render.
6. Only `done()` when the page loads without errors AND the requested feature is usable through the UI.
