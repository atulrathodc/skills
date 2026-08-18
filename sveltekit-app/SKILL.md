---
name: sveltekit-app
description: Build, run, and debug SvelteKit apps — +page files, +server routes, load functions, adapter, SSR.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# SvelteKit App

SvelteKit (Svelte meta-framework) specifics.

1. **File-based routing** — `src/routes/+page.svelte` (page), `src/routes/+page.server.js` (server data), `src/routes/+server.js` (API: `export function GET/POST`). Files starting `+` are the convention.
2. **Load functions** — `+page.server.js` exports `load()` returning `{ props }`; the page receives them. A page with no data = the load didn't return what the template expects.
3. **SSR + `browser`** — code in `load` runs on the server; `window`/`document` need `onMount` or `export const ssr = false`. Client-only setup goes in `onMount`.
4. **API + proxy** — `+server.js` routes are internal; for an external backend use the dev proxy or `fetch` the absolute URL. See `frontend-backend-integration`.
5. **Adapter** — `svelte.config.js` `adapter()` decides the output (node/static/vercel). A "page not found" after build is often the wrong adapter for the deploy.
6. **Run** — `npm run dev`, `npm run build` (needs an adapter), `npm run preview`. Verify page + route with curl.
