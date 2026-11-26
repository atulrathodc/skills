---
name: nextjs-app-router
description: Build and debug Next.js App Router applications (package.json) — Server vs Client Components, data fetching and caching semantics, Server Actions vs Route Handlers, streaming/Suspense, middleware, and production build verification.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# Next.js App Router

Most Next.js App Router bugs come from confusing Server Components with Client Components, misunderstanding caching/revalidation, or leaking server-only code/secrets into client bundles.

1. **Keep components Server Components by default; push `'use client'` to the leaves** — only add `'use client'` to small interactive leaf components that genuinely need `useState`, `useEffect`, browser APIs, or event handlers. Never slap `'use client'` on `app/layout.tsx` or entire pages just to silence an error.
2. **Never import server-only secrets, DB clients, or Node `fs` into Client Components** — mark server-only helper modules with `import 'server-only'` so the bundler fails loudly at build time if a client component accidentally imports them. Only `NEXT_PUBLIC_*` env vars are available in the browser.
3. **Know when to use Server Actions vs Route Handlers (`app/api/**/route.ts`)** — use **Server Actions** for internal form/UI mutations tightly coupled to your Next.js UI (always authenticate AND validate inputs with Zod inside every Server Action — they are public POST endpoints!); use **Route Handlers** for webhooks, external REST APIs, SSE streams, and OAuth callbacks.
4. **Be explicit about caching and dynamic rendering** — check the project's Next.js version (Next 15+ defaults `fetch` and GET Route Handlers to uncached, while Next 14 cached aggressively). Use explicit `cache: 'no-store'`, `next: { revalidate, tags }`, `revalidatePath`/`revalidateTag` after mutations, and `export const dynamic = 'force-dynamic'` when reading per-request cookies/headers.
5. **Handle Next.js 15+ async request APIs cleanly** — in Next.js 15+, `params`, `searchParams`, `cookies()`, and `headers()` are async (`await params`, `await cookies()`). Check `package.json` for the exact Next.js version before writing page/route signatures.
6. **Use `loading.tsx`, `error.tsx`, and `<Suspense>` boundaries deliberately** — wrap slow data fetches in `<Suspense>` so fast shell UI streams immediately, and ensure `error.tsx` is a `'use client'` component so runtime errors render cleanly instead of crashing the whole route.
7. **Keep `middleware.ts` lightweight and Edge-safe** — do not run heavy DB queries or Node-only libraries in Edge middleware; use middleware for lightweight redirects, locale routing, or optimistic cookie checks, and ALWAYS enforce real authorization inside Server Components, Server Actions, and Route Handlers.
8. **Verify with `next build`, not just `next dev`** — `next dev` skips strict TypeScript checks, static prerender failures (`useSearchParams()` missing `<Suspense>`), and server/client boundary leaks. Run `npm run build` (or `pnpm build`) and test the running app with `browser-e2e-verification`.

## Related skills

- `next-js-app` — canonical Next.js scaffolding and project setup.
- `react-frontend` — React component, state, and hook best practices.
- `browser-e2e-verification` — verifying rendered pages, hydration, and network calls live.
- `env-secrets-management` — keeping server secrets out of `NEXT_PUBLIC_*` bundles.
- `vercel-deployment` — deploying Next.js apps cleanly to Vercel.
