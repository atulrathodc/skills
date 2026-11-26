---
name: browser-e2e-verification
description: Verify live web apps end-to-end using the built-in browser() tool instead of ad-hoc Playwright scripts — inspect rendered DOM, console errors, network requests, screenshots, and real user flows across desktop and mobile viewports.
allowed-tools: Bash, Read, Grep, Glob, browser
---

# Browser E2E Verification

A passing build or HTTP `200` from `curl` does NOT prove a web app works. Verify the real rendered application interactively with the built-in `browser()` tool rather than writing throwaway Playwright/Puppeteer scripts.

1. **Always prefer the built-in `browser()` tool over ad-hoc Playwright/Puppeteer scripts** — do not install Playwright or write temporary `verify.mjs` scripts just to check a running page. Use `browser()` directly to navigate, click, type, inspect console logs, check network responses, and capture screenshots.
2. **Start the real app (and backend/proxy if multi-service) before opening the browser** — confirm the dev or production server is listening on its expected URL and health endpoint before navigating so you do not debug a dead port.
3. **Check console errors and uncaught exceptions on every page load** — a page that renders visually while throwing React hydration warnings, `TypeError`, or CSP violations is NOT verified. Inspect browser console output after every navigation and interaction.
4. **Inspect network requests for failed API calls and CORS/4xx/5xx responses** — verify XHR/fetch calls hit the intended backend origin, return `2xx`, and render real data (not silent empty states or fallback mocks masking a `404`/`500`/CORS block).
5. **Exercise the full user journey end-to-end** — actually fill forms, submit mutations, reload the page to verify persistence, test navigation and back/forward state, and check error/empty states — not just landing-page screenshots.
6. **Verify visual layout across viewports** — capture and inspect screenshots at desktop (e.g., `1440×900`) and mobile (`390×844`) widths to catch clipped text, horizontal overflow, overlapping sticky headers, broken images, or invisible contrast.
7. **Test auth and protected routes cleanly** — verify unauthenticated access redirects or blocks properly, log in through the real form, confirm session persists across reload, and verify logout clears access.
8. **Stop background servers cleanly when verification finishes** — leave no stray dev server processes occupying ports after confirming the end-to-end flow works.

## Related skills

- `browser-verification` — general live browser verification checklist.
- `browser-debugging` — diagnosing console, DOM, and rendering failures.
- `browser-network-debugging` — tracing failed API calls, CORS, and cookies.
- `e2e-testing` — authoring permanent automated Playwright/Cypress test suites in the repo.
- `runtime-verification` — verifying backend processes and live endpoints.
