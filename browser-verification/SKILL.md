---
name: browser-verification
description: PROVE a web feature actually works by driving it in a real browser — load the page, wait for readiness, exercise the real user interaction, assert the DOM/console/network, and confirm the frontend↔backend round-trip. A page that renders is not a feature that works.
allowed-tools: Bash, Read, Grep, Glob, browser
---

# Browser Verification

**A web feature is not done because the page loads, the build succeeded, or a component test passes.**
It is done when you drove the real interaction in a real browser and observed the real result.
This is the mechanics of that proof; `ui-verification` states the bar, `runtime-verification` is the language-agnostic mandate.

## Get to a real page first

1. **Serve the app, don't open `file://`** — a modern bundle (ESM, `fetch`, workers, CORS) does not work from the filesystem. Start the dev server in the background (`make-it-run`) and note the exact URL and port from its output — never guess the port.
2. **Confirm the server actually serves the app before blaming the browser** — `curl -s -o /dev/null -w "%{http_code}" http://localhost:<port>/` must be 200, and the HTML must reference the real bundle (`/assets/*.js`). A 200 with a stale or missing bundle is a blank page (see `browser-network-debugging`).
3. **Restart the server after your edit** — a dev server started before your change is serving OLD code, so you will "verify" the bug you just fixed. Check the process is not stale, and confirm HMR actually applied instead of assuming it did.

## Drive it like a user, not like a test harness

4. **Wait for a readiness signal, never a fixed sleep** — `await new Promise(r => setTimeout(r, 2000))` is the #1 source of flaky "it worked when I tried it". Poll for the condition you actually need (a selector exists, `document.readyState === 'complete'`, a spinner is gone, an element's text is non-empty) with a timeout, and fail loudly on timeout.
5. **Exercise the REAL interaction** — dispatch a true click/type on the element the user would touch (`el.click()`, focus + input events), not a call to an internal function or a store method. Calling your own code directly proves your code calls your code; it skips the handler wiring, the validation, and the render.
6. **Assert on the DOM, not on your mental model of it** — in the browser tool use a `js` op: `document.querySelector('[data-testid="total"]').textContent` must equal the expected value. "I saw it in the screenshot" is not an assertion; a readable assertion is.
7. **Assert the network actually happened** — the interaction must fire the request you expect, and it must return the status and payload you expect. A UI that renders the optimistic local state while the POST 500s looks perfectly healthy on screen (see `browser-network-debugging`, `http-api-testing`).
8. **The console must be clean** — any uncaught exception, failed request, or framework warning is a failure, even when the pixels look right. A caught-and-hidden error is still a bug (see `browser-debugging`).

## Prove the round-trip, not the render

9. **Close the loop through the backend** — create the thing in the UI, then confirm it persisted: reload the page, or re-fetch the resource, and check the value you entered is there. This is the only assertion that catches "the UI updated its own state and never told the server".
10. **Test the states the happy path skips** — loading, empty (zero rows), error (backend down / 500), and disabled/submitting. Most real bugs live in the empty and error states, which a single happy-path run never renders.
11. **Test validation rejection** — submit invalid input and assert the error message appears AND the request was NOT sent. A form that shows an error and submits anyway is the classic silent failure.
12. **Test the routing edges** — deep-link directly to a nested route, use the back button after a navigation, and **reload on a nested route**. A refresh that 404s means the server has no SPA rewrite fallback (`try_files ... /index.html`), which no client-side navigation test will ever reveal.
13. **Test auth as a flow, not a state** — log in, hit a protected route, confirm it renders the real content (not a redirect to login), then log out and confirm the protected route now blocks. Check a fresh session too: an app that "works" only because a token sat in `localStorage` from a previous run is not verified.

## Do not fool yourself

14. **Found ≠ visible** — `querySelector` returns elements that are `display:none`, `0×0`, transparent, behind an overlay, or scrolled off-screen. For anything user-facing assert visibility too: `el.getBoundingClientRect()` has non-zero width/height and the computed `display`/`visibility`/`opacity` allow paint. `document.elementFromPoint(cx, cy)` is inside the element confirms it is actually clickable.
15. **A screenshot proves paint, not behavior** — use it as evidence that the layout is not broken or blank, never as the assertion that a feature works. One screenshot cannot show that a click did anything (see `visual-regression`).
16. **Check the viewport you claim** — "works on mobile" needs the mobile viewport set and re-asserted, not a narrow desktop window. Re-run the key assertion at the breakpoints the feature is supposed to support.
17. **Re-run a failure before reporting it** — a single red run may be flake (timing, HMR, a port collision). Re-run once from a clean load and report whether it reproduces; do not "fix" a bug you cannot reproduce.
18. **Verification is not done when a run passes once** — if you changed code after the passing run, the run is void. Re-drive the browser on the new build.

## Report what you actually observed

19. **State the evidence precisely** — the URL and port, the viewport, the exact interaction sequence, and the observed result. "Loaded the page and it works" is not a report; "at `localhost:5173/todos`, clicked Add, POST `/api/todos` returned 201, reloaded and the row is present, console clean" is.
20. **Say plainly what you did not verify** — if you only checked the happy path, or never exercised the backend, or drove a stale build, say so. An unqualified "verified" on a partial run is worse than an honest gap.
21. **Never call `done()` on "the page loads"** — a 200 response and a non-blank screenshot are the *entry condition* for verification, not the verification. If you did not drive the feature the task asked for, it is unverified.

## Related skills
- `ui-verification` — the concise bar this skill implements in full.
- `runtime-verification` — the language-agnostic "prove the complete behavior" mandate.
- `browser-debugging` — what to do when the browser run above fails.
- `browser-network-debugging` — the request/response layer behind every failing round-trip.
- `visual-regression` — screenshot discipline when appearance is the thing under test.
- `make-it-run` / `http-api-testing` — getting the app served, and probing its API directly.
- `frontend-backend-integration` — the round-trip this skill exists to prove.
