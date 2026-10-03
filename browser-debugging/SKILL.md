---
name: browser-debugging
description: Debug a web page that is broken in the browser — read the console first, classify the failure (blank page, wrong render, wrong data, unresponsive), inspect live DOM/state/computed styles instead of guessing, and fix the root cause. Covers uncaught JS errors, silent handler failures, hydration mismatches, and stale HMR/cache.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write, browser
---

# Browser Debugging

The browser is the only place a frontend bug is real. Source code that looks correct and a page that
misbehaves means your model of the runtime is wrong — so **observe the runtime** instead of re-reading the code.
This is the diagnose half; `browser-verification` is the prove-it-works half, and `systematic-debugging` is the generic method.

## Start with evidence, not hypotheses

1. **Read the console before anything else** — an uncaught exception names the file and line that broke, and a failed request logs its own URL and status. Most "the UI is broken" reports are answered there in one look. Capture the errors explicitly with a `js` op rather than eyeballing.
2. **Classify the failure before fixing anything** — the fix is completely different for each, and guessing sends you down the wrong path:
   - **Blank page** → the app never mounted: a JS error before render, a missing/404 bundle, or a wrong asset base path.
   - **Renders but wrong** → CSS/computed style, layout, or stale state.
   - **Renders but wrong data** → the request failed or the payload shape is not what the component reads.
   - **Renders but unresponsive** → the handler never bound, an error is thrown on click, or an overlay is eating the pointer.
   - **Renders, then dies** → an async error after the first paint.
3. **Reproduce deterministically, then narrate the exact trigger** — "clicking Save on the empty form throws" is a bug you can fix; "the form is broken sometimes" is not. Get the minimal click/type sequence that always reproduces it, and write it down before you touch code.
4. **Suspect the stale build before you suspect the code** — a dev server serving a pre-edit build, an HMR update that silently failed to apply, or a service worker serving a cached bundle will reproduce a bug you already fixed. Hard-reload, disable the service worker, and restart the dev server before you theorize (see `browser-network-debugging`, the stale-bytes items).

## Inspect the live runtime

5. **Probe the real state instead of guessing it** — in the browser tool use a `js` op: read the actual DOM node, the computed style, the store/global, and the props. "It should be `display:flex`" is a guess; `getComputedStyle(el).display` is a fact, and it often contradicts the stylesheet you were staring at.
6. **Styles that "aren't applying" are a cascade problem, not a syntax problem** — check the computed value first, then work back: the rule lost specificity, a later rule overrode it, the class was never added to the element, the stylesheet 404'd, or a CSS-module hash mismatched. Inspecting the element's `classList` and `getComputedStyle` separates "wrong element" from "wrong rule".
7. **"The element is there but I can't see it"** — walk the visibility ladder in order: zero-size (`getBoundingClientRect()` is `0×0`), `display:none`, `visibility:hidden`, `opacity:0`, clipped by an `overflow:hidden` ancestor, painted off-screen, or covered by another element (`document.elementFromPoint`). Each has a different cause; the screenshot alone cannot tell them apart.
8. **"The click does nothing" — prove whether the handler ran** — add a temporary log or set a global inside the handler and re-click. If it never logs, the click never reached the element: an overlay is intercepting it, the listener was bound to a node that got replaced, or the framework's synthetic event system (`onClick`) was bypassed by a raw `addEventListener` or vice versa. If it does log, the bug is downstream in the handler or the render.
9. **Stale closures and missing `await` are the classic silent failures** — a handler reading a state variable captured at first render sees the old value forever; an async call without `await` runs after the code that depends on it. Log inside the handler in order — a log appearing *after* the "done" log is the bug.
10. **Check the framework's own error overlay and devtools output** — Vite/Next/CRA overlays and the devtools panel report hydration mismatches, invalid hook calls, missing keys, and prop-type errors that never reach `console.error` in a form you would notice. A hydration mismatch (server HTML ≠ first client render) shows as content that flickers or reverts right after load.

## Narrow it with real tooling

11. **Pause on the failure instead of print-debugging everything** — a `debugger;` statement in the suspected path, or "pause on exception" in the browser tool, gives you the live call stack, locals, and scope at the moment of the throw. That beats ten speculative `console.log`s.
12. **Read the stack through the source maps** — a minified production bundle reports `a.b is not a function` at `main.abc123.js:1:48213`. Load with source maps (or debug the dev build) so the trace names your actual files; if it cannot, bisect by feature instead of guessing at the minified name.
13. **Bisect the failure point rather than reasoning about the whole flow** — confirm the module evaluated, the component mounted, the data arrived, then the render ran. The first step that did not happen is the bug, and it is usually one line before where the symptom appears.
14. **Filter out the noise** — browser extensions, third-party analytics, ad blockers, and CORS errors from unrelated origins clutter the console. Confirm an error's origin is your code before chasing it; conversely, do not dismiss a real error because the console is noisy.
15. **Check the environment-specific variables** — a bug that only appears in the prod build is usually minification, `NODE_ENV` branches, a missing env var baked in at build time, or a base path. A bug that only appears in one browser is a feature-detection or vendor-prefix gap.

## Fix it, then prove it

16. **Fix the root cause, not the symptom** — suppressing the error, wrapping it in `try/catch` to silence the console, or special-casing the one input that crashed leaves the bug in place for the next input. Name the actual cause in one sentence before you edit; if you cannot, you have not found it yet.
17. **Confirm the fix on a clean load** — hard-reload on the new build and re-drive the exact trigger sequence you wrote down in step 3. The bug is fixed when the originally-failing interaction now succeeds, not when the console stops printing.
18. **Re-check the console and the network after the fix** — a fix that removes the crash but introduces a 500, or trades the error for a warning, is not a fix.
19. **Remove every debug artifact before finishing** — `debugger` statements, `console.log` scaffolding, temporary globals, commented-out code, and the `alert()` you added to check reachability. A `debugger;` left in a bundle halts execution for the next person with devtools open.
20. **Report the cause and the evidence** — state the root cause, the file and line, the trigger sequence, and the observed before/after. "Fixed the render bug" is not a report; "`useEffect` had no dependency array, so the fetch re-fired every render and the last response overwrote state with stale data; added `[]` and re-drove the flow clean" is.

## Related skills
- `browser-verification` — the proof loop to run once the bug is fixed.
- `browser-network-debugging` — for any failure that is a request, response, CORS, cookie, or cache problem.
- `systematic-debugging` — the general reproduce → isolate → root-cause → verify method.
- `mobile-app-debugging` — the same discipline for native/RN/Flutter rather than the web.
- `runtime-crash-recovery` / `startup-failure-recovery` — when the app or server itself dies.
- `react-frontend` / `next-js-app` — framework-specific mounting, hydration, and HMR behavior.
