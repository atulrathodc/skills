---
name: nuxt-app
description: Build, run, and debug Nuxt apps — pages/router, auto-imports, server routes, SSR, nuxt.config.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# Nuxt App

Nuxt (Vue meta-framework) specifics.

1. **File-based routing** — `pages/<name>.vue` = a route (`pages/users/index.vue` → `/users`). Components in `components/` auto-import by filename.
2. **Server routes** — `server/api/<name>.get.ts` exports the handler (Nitro); call it with `$fetch('/api/<name>')` — relative, not absolute.
3. **SSR vs client** — code in `pages/` runs on server + client. Use `useAsyncData`/`useFetch` for data (SSR-aware). A `window`/`document` reference must be guarded or moved to `onMounted`/client-only.
4. **Config** — `nuxt.config.ts`: `runtimeConfig` (env), `routeRules`, `devProxy` (map `/api` to the backend — see `frontend-backend-integration`).
5. **Run** — `npm run dev`, `npm run build`, `npm run preview`. Verify page + API route with curl (see `make-it-run`, `http-api-testing`).
6. SSR errors appear in the server console — the FIRST error is the cause.
