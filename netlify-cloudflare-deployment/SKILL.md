---
name: netlify-cloudflare-deployment
description: Deploy static sites and edge functions to Netlify and Cloudflare — netlify.toml build command and publish dir, netlify deploy --prod, functions, SPA redirect, deploy previews; wrangler.jsonc/wrangler deploy, Cloudflare Pages output dir, _headers/_redirects, KV/R2/D1 bindings, compatibility date; plus GitHub Pages base path and S3+CloudFront index/error-document rewrites.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# Netlify & Cloudflare Deployment

Netlify and Cloudflare Pages deploy the build FOLDER — so the two things that break are the publish directory and the SPA fallback.

1. **Declare the build in `netlify.toml`, exactly mirroring local commands** — `[build] command = "npm run build"` and `publish = "dist"` (or `build`, `out`, `.output/public` — whatever your bundler emits). Netlify runs `command` in a clean container and uploads `publish` verbatim; if that directory does not exist, the deploy "succeeds" with an empty site. Check the deploy log's "Deploy directory ... does not exist" line.
2. **Ship a `netlify.toml` with redirects and headers, not dashboard-only config** — SPA catch-all `[[redirects]] from = "/*" to = "/index.html" status = 200` (the `200` is a rewrite; `301`/`302` would change the browser URL and break client routing), API proxy `from = "/api/*" to = "https://api.example.com/:splat" status = 200 force = true`, and `[[headers]]` for `Cache-Control`/CSP. Rules are evaluated top-down — a catch-all above `/api/*` swallows the API.
3. **Netlify functions and deploy previews** — put handlers in `netlify/functions/*` (Node ESM or Go), set `[functions] directory = "netlify/functions"`, and call them at `/.netlify/functions/<name>`. Every PR gets a deploy preview URL with its own env context; verify the preview, not just production, because preview env vars differ by context. Deploy from the CLI with `netlify deploy` (draft URL, for review) and `netlify deploy --prod` (production alias).
4. **Cloudflare Pages: build output dir + `_redirects`/`_headers` files** — set the build command and output directory in the Pages project (or `wrangler pages deploy ./dist --project-name <name>`). Add a literal `_redirects` file IN the output dir (`/* /index.html 200`) and `_headers` (`/*\n  X-Frame-Options: DENY`) — they must be inside the uploaded folder, not the repo root, or Cloudflare never sees them. Without `_redirects`, a deep link on a SPA hard-refresh returns Cloudflare's 404 — the single most common Pages bug.
5. **Workers: config file, bindings, and compatibility date** — `wrangler.jsonc` declares `main`, `compatibility_date` (pin an explicit date; behaviour changes with it), `observability.enabled = true`, and bindings: `kv_namespaces`, `r2_buckets`, `d1_databases`, `vars`. Bindings exist only after you run the create commands (`wrangler kv namespace create CACHE`, `wrangler d1 create db`) and paste the returned ids into the config. Deploy with `wrangler deploy`; tail logs with `wrangler tail`. A Worker that works in `wrangler dev` but throws `X is not defined` in production is running with a `compatibility_date`/runtime flag mismatch.
6. **Never publish secrets into a static bundle** — anything referencing `process.env`/`import.meta.env` in frontend code is inlined at build time and readable by anyone. Build-time vars go in the host's build environment; runtime secrets belong in the function/Worker environment (`wrangler secret put NAME`, Netlify env vars scoped to Functions).
7. **GitHub Pages needs the base path, or every asset 404s** — a project site is served from `https://<user>.github.io/<repo>/`, so the bundler needs `base: '/<repo>/'` (Vite) / `homepage` (CRA) / `baseURL` (Nuxt). Symptom: the HTML loads, CSS and JS 404, page is unstyled and dead. Also add `.nojekyll` so directories starting with `_` are not stripped.
8. **S3 + CloudFront: index document plus the error-document rewrite** — set the bucket/Origin's Index document to `index.html` AND Error document to `index.html` with `403`/`404` error responses mapped to `200` for SPA routing, or deep links fail. After any content swap, invalidate the CDN (`aws cloudfront create-invalidation --distribution-id <id> --paths '/*'`) or you will serve the previous build for the whole TTL — the classic "my deploy didn't show up".
9. **Verify from the public URL, deep link included** — `curl -sS -o /dev/null -w '%{http_code}\n' https://<site>/` and `curl -sS https://<site>/some/deep/route` must both be 200 (not 404), then confirm the served HTML contains the new build marker. Continue with `deployment-verification`.

## Related skills

- `deployment-strategy` — choosing a static/edge host and rollout policy.
- `deployment-verification` — proving the deployed build serves.
- `static-frontend` — the plain-HTML/CSS/JS output these hosts consume.
- `astro-app` — static-vs-SSR output differences that change the publish dir.
- `caching-strategies` — Cache-Control and CDN invalidation done right.
- `secret-management` — keeping build-time and runtime secrets apart.

───
