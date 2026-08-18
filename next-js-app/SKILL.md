---
name: next-js-app
description: Build, run, and debug Next.js apps — App vs Pages Router, SSR/SSG, dev/build/start, route and API-route files, rewrites.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# Next.js App

Next.js specifics that trip up agents.

1. **Two routers — know which one the app uses.** `app/` directory (App Router, server components by default) vs `pages/` (Pages Router). Files: `app/page.tsx`/`app/layout.tsx` or `pages/index.tsx`. Grep for `"use client"` and `useRouter`/`getServerSideProps` to tell.
2. **Scripts** — `npm run dev` (dev server), `npm run build`, `npm start` (serves the production build — must build first). Read `package.json` + `next.config.*`.
3. **Server vs client components (App Router)** — files without `"use client"` are SERVER components: no `useState`/`useEffect`/event handlers there. Add `"use client"` at the top of a component that needs browser APIs.
4. **Data fetching** — Pages Router: `getServerSideProps` (per-request) / `getStaticProps` (build-time). App Router: `async` server components + `fetch` (cached by default; `cache: "no-store"` for dynamic). Match the app's existing pattern.
5. **API routes** — `app/api/<name>/route.ts` (App Router, export `GET`/`POST` functions) or `pages/api/<name>.ts`. Call them with `fetch('/api/...')` — relative, not absolute.
6. **Proxy/rewrites** — `next.config.*` → `rewrites()` maps `/api/*` to the backend; or a middleware. Use it for frontend↔backend (see `frontend-backend-integration`).
7. **Verify** — `npm run build` then `npm start` (or `npm run dev`), curl the page AND an API route. SSR errors show in the server console — the FIRST error is the cause.
