---
name: vercel-deployment
description: Deploy to Vercel — vercel.json, framework presets, output directory, vercel --prod, PR preview deployments, serverless vs Edge function limits, per-environment env vars, rewrites/redirects/headers, monorepo root directory, domains/DNS, deployment protection, vercel logs, and the 404-on-refresh and function-invocation-failure causes.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# Vercel Deployment

Vercel deploys whatever your build emits into an immutable CDN plus functions — the surfacing bugs are almost always output-directory, rewrite, or runtime-limit misconfiguration.

1. **Let the framework preset do the build, then verify the output directory it inferred** — Vercel auto-detects Next.js/Nuxt/SvelteKit/Astro/Vite/CRA and expects `.next`/`.output/public`/`dist`/`build` respectively. If your build writes elsewhere, set `outputDirectory` (for a plain static site) in `vercel.json`; a wrong output dir deploys an empty CDN and every route 404s even though the build log is green.
2. **Pin the project config in `vercel.json`, not only in the dashboard** — `{"buildCommand": "npm run build", "outputDirectory": "dist", "installCommand": "npm ci", "framework": "vite", "regions": ["iad1"]}`. Dashboard-only settings are invisible in review and drift between projects; the file is versioned and reviewed.
3. **Deploy with the CLI for confidence, and know the two targets** — `vercel link` then `vercel` creates a **preview** deployment (unique URL per commit, the default for every PR); `vercel --prod` promotes to the production domain alias. In CI, `VERCEL_TOKEN` + `vercel deploy --prod --token=$VERCEL_TOKEN` avoids interactive prompts. Copy the printed `Deployment URL` — that is your verification target.
4. **Know the serverless/Edge limits before you write the handler** — no persistent disk (writes to `/tmp` vanish with the invocation); request/response body and bundle-size caps; a default execution duration that long scrapes and slow queries exceed; and Edge Runtime is a V8 isolate without Node APIs (`fs`, `child_process`, most native modules) and with a much smaller bundle budget. Choose `export const config = { runtime: 'nodejs' }` deliberately; a function that imports a native module dies only at invocation, not at build.
5. **Scope env vars per environment** — Production / Preview / Development are three separate sets. A variable set only for Production makes every preview 500 on the first request. Anything prefixed `NEXT_PUBLIC_`/`VITE_` is inlined at BUILD time into the client bundle, so changing it requires a new deployment, not a restart — and it must never hold a secret.
6. **Monorepos need the root directory and a touched-project filter** — set Root Directory to the app folder (or `vercel --cwd apps/web`), or the build runs from the repo root and cannot find the manifest. With multiple apps, configure "Ignored Build Step" so a change in `apps/api` does not rebuild `apps/web`.
7. **Rewrite/redirect/header rules are the SPA and API-proxy story** — a client-side-routed SPA needs a catch-all rewrite to `index.html`, or a hard refresh on `/dashboard` returns Vercel's 404: `{"rewrites": [{"source": "/(.*)", "destination": "/index.html"}]}` — and the rewrite must NOT swallow `/api/*`; order rules so API paths come first. Cross-origin API calls that 404 are usually a missing rewrite or a wrong `destination`; CORS preflight failures need `{"headers": [...]}` or the API on the same origin.
8. **Domains and protection** — add the domain in Project → Domains and point DNS at the apex/`www` record Vercel prints; HTTPS certificates are automatic but only for a correctly pointed domain. Preview deployments are public by default — enable Vercel Authentication / Password Protection for anything staging-like, otherwise unreleased work and preview-only env vars are internet-reachable.
9. **Read the right log** — `vercel logs <deployment-url>` for runtime output, build logs for build failures, and the function's own invocation log for an uncaught exception. A 500 with no stack is usually a missing env var (undefined at import time in a module-scope database client) or a native-module import in Edge runtime.
10. **Verify the deployed artifact, both URLs** — `curl -sS -o /dev/null -w '%{http_code}\n' https://<production-domain>/` and the same against the preview URL, plus the actual API path (`curl -sS https://<domain>/api/health`) — a 200 on `/` does not prove `/api/*` works. Confirm the served HTML is the NEW build (check a build hash/commit marker), then walk the flow in `deployment-verification`.

## Related skills

- `deployment-strategy` — choosing Vercel at all, and env/rollout policy.
- `deployment-verification` — proving the new build actually serves.
- `next-js-app` — rendering-mode and route-file specifics that change what gets deployed.
- `react-frontend` — Vite/React build output and dev proxy vs production API base.
- `environment-setup` — env var names and local parity with the platform.
- `ci-cd-troubleshooting` — when the deploy step, not the code, fails.

───
