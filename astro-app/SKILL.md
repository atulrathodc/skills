---
name: astro-app
description: Build, run, and debug Astro apps — islands, .astro components, content collections, static vs SSR.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# Astro App

Astro specifics — ship zero JS by default, add islands where needed.

1. **`.astro` files** — component markup runs at build time (server); frontmatter (`---`) runs on the server. What you write there is static unless you add an island.
2. **Islands** — a framework component (React/Vue/Svelte) becomes interactive when `client:load`/`client:visible` is added to its usage. A button that "does nothing" = the island directive is missing.
3. **Routing** — `src/pages/<name>.astro` = a route; `[dynamic].astro` for params; `src/content/` collections for content-driven pages.
4. **Server routes** — `src/pages/api/<name>.ts` (`export const GET/POST`) for API routes (works in SSR or static-with-adapter).
5. **Static vs SSR** — default is static output (no server at runtime). For a backend/proxy, enable `output: 'server'` in `astro.config.mjs` + an adapter, or use `client` fetch to an external backend (see `frontend-backend-integration`).
6. **Run** — `npm run dev`, `npm run build` → `dist/` (static) — serve it (see `make-it-run`). Verify page + API with curl.
