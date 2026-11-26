---
name: github-pages-deployment
description: Deploy static sites and SPAs cleanly to GitHub Pages — Actions actions/deploy-pages vs gh-pages branch, subpath base URLs (/<repo>/), custom domain CNAME, .nojekyll, SPA 404.html fallback, and live URL verification.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# GitHub Pages Deployment

GitHub Pages is simple until a site deploys to `https://<user>.github.io/<repo>/` and every JS/CSS bundle 404s, `_next`/`_assets` folders vanish under Jekyll, or refreshing `/dashboard` hits GitHub's 404 page.

1. **Set the build `base` path to match the real Pages URL** — project sites serve under `/<repo>/` (not `/`), while user/org sites (`<user>.github.io`) and custom domains (`CNAME`) serve at `/`. Configure `base: '/<repo>/'` in `vite.config.ts` (or `basePath` + `output: 'export'` in `next.config.*`, `site`/`base` in `astro.config.*`) so asset URLs resolve cleanly instead of 404ing at the domain root.
2. **Always include `.nojekyll` in the published output directory** — GitHub Pages runs Jekyll by default, which silently ignores directories starting with an underscore (`_next/`, `_astro/`, `_assets/`). Touch an empty `.nojekyll` file in `dist/`/`out/` (or use `actions/deploy-pages`, which bypasses Jekyll).
3. **Handle SPA client-side routing fallbacks explicitly** — GitHub Pages has no server rewrite rules (`try_files`). For SPAs (`react-router`, Vue Router), either use `HashRouter` or copy `index.html` to `404.html` (or use a lightweight redirect shim) so hard-refreshing nested routes like `/<repo>/settings` loads the app instead of GitHub's 404 page.
4. **Prefer GitHub Actions (`actions/upload-pages-artifact` + `actions/deploy-pages`) over manual `gh-pages` pushes** — set workflow `permissions: { contents: read, pages: write, id-token: write }`, set `concurrency: { group: pages, cancel-in-progress: false }`, build cleanly from lockfile, upload the output dir, and deploy to the `github-pages` environment.
5. **Preserve `CNAME` when using a custom domain** — put `CNAME` inside `public/` so every build copies it into `dist/` automatically; otherwise a fresh deploy overwrites the `gh-pages` branch and disconnects the custom domain.
6. **Never ship secrets or backend expectations to GitHub Pages** — Pages is strictly static hosting (no server routes, no SSR, no server env vars). Point API calls at an explicitly deployed backend URL with the Pages origin (`https://<user>.github.io`) added to the backend's `CORS_ALLOWED_ORIGINS`.
7. **Preview with the exact `base` path locally before pushing** — run `npm run build && npm run preview` (confirming assets load under `/<repo>/` with zero `404`s in DevTools), then verify the live `github.io` URL after deployment completes.

## Related skills

- `react-vite-spa` — Vite `base` config, asset paths, and SPA routing.
- `static-frontend` — static site build hygiene and asset optimization.
- `ci-cd-pipeline` — GitHub Actions workflow permissions and caching.
- `deployment-verification` — verifying the live deployed Pages URL and assets.
- `api-gateway-cors` — allowing the `github.io` origin on backend APIs.
