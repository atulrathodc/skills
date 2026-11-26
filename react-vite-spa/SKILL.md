---
name: react-vite-spa
description: Build, configure, and ship React + Vite single-page applications (package.json) — clean state/data fetching, Vite dev proxy and VITE_* env vars, SPA fallback routing, code splitting, and production bundle verification.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# React Vite SPA

Vite makes local dev instant, which hides three classic production bugs until deploy: broken SPA deep-link refreshes (`404` on `/dashboard`), wrong `base` asset paths, and leaked/unconfigured `VITE_*` API URLs.

1. **Use Vite's `server.proxy` in dev and `VITE_API_BASE_URL` cleanly** — route API calls through a single typed client module (`src/lib/api.ts`) using `import.meta.env.VITE_API_BASE_URL ?? '/api'`. Configure `server.proxy['/api']` in `vite.config.ts` so local dev avoids CORS errors while production builds stay configurable. Never put secrets in `VITE_*` vars (everything with `VITE_` is baked into client JS).
2. **Keep server state out of `useEffect` boilerplate when possible** — prefer TanStack Query / SWR (or clean `AbortController` cleanup if using raw `fetch` in `useEffect`) so race conditions, stale responses on unmount, loading/error states, and refetching are handled reliably. Never leave an unguarded `useEffect` firing infinite fetch loops from unstable object/function dependencies.
3. **Configure SPA history fallback for production hosting** — client-side routing (`react-router-dom`) returns `404` on hard refresh of `/orders/123` unless the static server/Nginx/Netlify/Vercel rewrites unknown non-asset paths to `/index.html` (`try_files $uri $uri/ /index.html;`).
4. **Set `base` explicitly if deployed under a subpath** — if served at `/app/` instead of `/`, set `base: '/app/'` in `vite.config.ts` and `basename="/app"` on the router, and reference public assets via `import` or `${import.meta.env.BASE_URL}` rather than hardcoded `/logo.png`.
5. **Keep components focused and keys stable** — never use array index as a React `key` on reorderable/mutable lists, derive computed values during render instead of syncing them via `useEffect`, and wrap route-level views in `React.lazy` + `<Suspense>` and an Error Boundary so one broken widget doesn't blank the entire screen.
6. **Enforce strict TypeScript + build gates before calling done** — run `tsc --noEmit` AND `npm run build` (`vite build` does NOT run TypeScript typechecking by itself!). Check bundle warnings for giant unintended chunks or Node polyfill errors.
7. **Verify the real production preview with `browser-e2e-verification`** — run `npm run preview` (or the real Nginx/Docker container), navigate directly to nested routes, hard-reload to confirm SPA fallback works, and check console + network tabs via `browser()`.

## Related skills

- `react-frontend` — React component architecture and hook patterns.
- `browser-e2e-verification` — verifying rendered SPA flows, console, and API calls via `browser()`.
- `service-url-config-mapping` — wiring `VITE_*` URLs and dev proxies cleanly.
- `state-management` — choosing local state, context, Zustand, or query caches.
- `tailwind-css` — styling React components cleanly with Tailwind.
