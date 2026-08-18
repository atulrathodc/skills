---
name: react-frontend
description: Build, run, and verify React/Vite frontends — install, dev/build scripts, dev proxy to the backend, API base URL, CORS.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# React Frontend

React/Vite specifics that trip up agents wiring a frontend to a backend.

1. **Install** — `npm install` in the frontend dir (Vite scaffold: `npm create vite@latest . -- --template react`). Never hand-roll node_modules.
2. **Scripts** — `npm run dev` (dev server), `npm run build` (production build to `dist/`). Read `package.json` first.
3. **Dev proxy** — in `vite.config.js` add `server.proxy` mapping the API base to the backend, so the frontend can call `/api/...` without CORS in dev:
   ```js
   server: { proxy: { "/api": "http://localhost:<backendPort>" } }
   ```
4. **API base URL** — the frontend's `fetch`/`axios` base should be relative (`/api`) to work through the proxy in dev AND the served build. Absolute `http://localhost:<port>` hardcodes and breaks.
5. **CORS in production** — if the frontend is served from a different origin than the backend, the backend must allow it (or use the proxy). See `frontend-backend-integration`.
6. **Verify** — start the dev server (background), curl the frontend URL and an endpoint that calls the backend; confirm the data round-trips (see `http-api-testing`, `make-it-run`).
7. A frontend that "compiles" is not done — it must RUN and reach the backend.
