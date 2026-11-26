---
name: e2e-testing
description: Write fast, deterministic end-to-end browser tests with Playwright or Cypress — user-facing locators, eliminating waitForTimeout flakes, auth state reuse, test data isolation, trace debugging, and CI sharding.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# E2E Testing

E2E tests are your highest-confidence safety net and your fastest source of CI misery if written with brittle selectors and arbitrary sleeps. Keep the suite focused on critical user journeys and ruthlessly deterministic.

1. **Locate elements like a user, never by CSS structure or generated classes** — prefer `getByRole('button', { name: 'Save' })`, `getByLabel('Email')`, and `getByText(...)`; fall back to explicit `data-testid` attributes when semantics are ambiguous. Never use brittle XPath or `.div > span:nth-child(3)` / Tailwind utility class selectors.
2. **Ban `waitForTimeout` / `cy.wait(3000)` completely** — fixed sleeps are both slow and flaky. Rely on web-first auto-retrying assertions (`await expect(locator).toBeVisible()`, `await expect(page).toHaveURL(...)`) or wait on a specific network response (`page.waitForResponse(...)`).
3. **Authenticate once and reuse `storageState`** — do not click through the login UI in every single test. Use a setup project (`auth.setup.ts`) or API login helper to save authenticated cookies/localStorage to a `storageState` file and reuse it across tests. Keep one dedicated test that verifies the actual login UI flow.
4. **Isolate test data so tests can run in parallel and in any order** — each test should create its own unique entities (via API/DB seed helper with unique IDs) and never depend on state left behind by a previous test. Shared mutable fixtures cause order-dependent flakes that vanish when run solo.
5. **Test against a real local backend; stub only flaky third-party externals** — hit your real API and test database so serialization, auth, and migrations are actually exercised. Use `page.route()` to stub external payment widgets, email providers, or third-party APIs that rate-limit or cost money in CI.
6. **Keep E2E coverage focused on critical journeys, not every edge case** — cover sign-up/login, core CRUD/checkout flows, permission boundaries, and cross-page navigation in E2E; push exhaustive validation permutations down to fast unit and API integration tests.
7. **Always capture traces, screenshots, and console errors on failure** — configure `trace: 'on-first-retry'`, `screenshot: 'only-on-failure'`, and fail tests on uncaught `pageerror` / unexpected `console.error` so broken JS does not slip past a lenient assertion.
8. **Run the built production app in CI, not just the dev server** — HMR and dev overlays hide bundling/SSR bugs and slow down tests. Configure `webServer` to start the production build (`npm run build && npm run start`) and wait on its health URL before launching tests.
9. **Diagnose flakes by reproducing with `--repeat-each` and inspecting traces** — run `npx playwright test path/to/test --repeat-each=10` to verify a fix actually eliminated the race instead of passing by luck, and inspect the trace viewer (`npx playwright show-trace`) to see exact DOM snapshots and network timing.
10. **Shard across CI workers once the suite passes ~3–5 minutes** — use `playwright test --shard=1/4` with browser binary caching so E2E feedback stays fast enough that developers actually wait for it.

## Related skills

- `browser-verification` — ad-hoc live browser verification during development.
- `browser-debugging` — inspecting console, DOM, and runtime errors.
- `browser-network-debugging` — debugging failing XHR/fetch/CORS calls in the browser.
- `visual-regression` — screenshot diffing for UI appearance changes.
- `integration-testing` — API and database boundary tests below E2E.
