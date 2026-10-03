---
name: visual-regression
description: Verify UI appearance with screenshots — make rendering deterministic (freeze animation/clock/randomness/fonts, fix viewport and DPR), capture the states and breakpoints that matter, diff against a reviewed baseline with a sane threshold, and know what a screenshot can and cannot prove.
allowed-tools: Bash, Read, Grep, Glob, browser
---

# Visual Regression

Screenshots are the only way to catch the class of bug that is invisible to every functional assertion:
overlap, cut-off text, a broken layout, a wrong color, a misplaced element. But an unreviewed screenshot
proves nothing, and a non-deterministic one fails for reasons unrelated to your change.

## Screenshots are evidence, not proof

1. **Know the split** — a screenshot **can** prove layout, spacing, overflow, overlap, color, and "not blank". It **cannot** prove that a button works, that data persisted, or that a request succeeded. A green pixel-diff on a page where every click throws is a false green — pair it with `browser-verification`.
2. **A screenshot that is never looked at is not a check** — a baseline auto-accepted on first run encodes whatever was on screen, including the bug. Someone must review a new or changed baseline and say "this is correct" before it becomes the reference.
3. **Automate the "not blank" floor even if you review by eye** — assert the frame is not a single uniform color and not the error-page background. A blank/white or all-black screenshot is the most common "verified" artifact that actually means the app crashed (see `browser-debugging`).

## Determinism before diffing

4. **Freeze animation or every diff is noise** — a CSS transition, a spinner, a carousel, or a marquee will differ between two captures of identical code. Disable animations/transitions for the capture (`*, *::before, *::after { animation: none !important; transition: none !important; }`), or emulate `prefers-reduced-motion` and make sure the app honors it (see `css-animation`, `motion-design`).
5. **Wait for the paint to settle, not a fixed sleep** — poll until webfonts are loaded (`document.fonts.ready`), images are complete (`img.complete` and non-zero `naturalWidth`), and no pending layout shift remains. A capture taken mid-load diffs against a *timing* difference, not a code difference.
6. **Fonts are the #1 cross-machine diff** — a missing or late webfont swaps metrics and reflows every line of text. Load the real webfonts and await `document.fonts.ready` before capture, and use the same font stack in CI as in the baseline environment.
7. **Pin the viewport and the device pixel ratio** — an unspecified viewport means the window size decides the layout, so the same code produces different screenshots on different machines. Set an explicit width/height **and** `deviceScaleFactor` (a 2× capture of a 1× baseline diffs everywhere) and keep them identical between capture and comparison.
8. **Pin the clock, the randomness, and the data** — a "3 minutes ago" timestamp, an avatar from a random service, a seeded-only-by-chance scatter plot, or live API data guarantees a flaky diff. Inject a fixed date, seed randomness, and serve deterministic fixture data for the capture rather than hitting the real backend.
9. **Capture the viewport, not the scroll position you happened to be at** — scroll to a defined position (usually top) before capture, and decide deliberately between viewport-sized and full-page captures. Full-page is better for layout; viewport is more stable for apps with lazy-loaded content that shifts the page height.

## Cover the states, not the screenshot you like

10. **Capture the states that break, not just the default** — a component with data almost never breaks; the same component **empty**, **loading**, **error**, and **with one very long string** is where it breaks. At minimum capture: default, loading, empty, error, and long-content.
11. **Capture the interaction states** — hover, focus-visible, active, disabled, and selected. Keyboard focus is invisible in a default screenshot and is exactly what `accessibility` requires you to preserve.
12. **Capture the breakpoint matrix** — a narrow mobile width, a tablet width, and a wide desktop width, plus the exact breakpoint boundaries (one pixel below and at the breakpoint) where layouts flip. A layout that is fine at 1280 and 375 can still collapse at 768.
13. **Capture dark mode, RTL, and reduced-motion when the app claims to support them** — a feature that claims dark-mode support and has never been screenshotted in dark mode is unverified; hardcoded whites and invisible focus rings only show up there.
14. **Capture at the text scale users actually use** — 200% browser zoom or a larger root font size is where fixed-height containers clip their content. If the layout only works at 100%, that is a bug worth catching before a user does.

## Compare honestly

15. **A zero-tolerance pixel diff is unusable** — anti-aliasing and subpixel rendering produce inherent noise. Use a small per-pixel color threshold and allow a tiny percentage of differing pixels, and set those numbers deliberately rather than accepting the defaults.
16. **Mask or exclude the regions you cannot stabilize** — dates, avatars, ads, user content, and third-party widgets belong in a mask list. Masking a region is honest; deleting an assertion is not.
17. **When a diff is ambiguous, measure the DOM instead of squinting** — "the box looks shifted" is not a diagnosis. Read `getBoundingClientRect()`, `getComputedStyle()`, and `scrollWidth` vs `clientWidth` via a `js` op for the exact geometry (a `scrollWidth > clientWidth` means content is overflowing its container). Numbers settle what pixels only suggest.
18. **A red diff is a question, not a verdict** — review the diff image and decide whether the change is intended. An intended change means the baseline should be updated (and the update reviewed); an unintended change is the bug.
19. **Triage flake before blaming the code** — if the same commit diffs differently across runs, hunt the non-determinism in §4–8 rather than chasing a layout bug that does not exist. Report the flake rate instead of re-running until green.

## Related skills
- `browser-verification` — the functional half; screenshots must be paired with it.
- `browser-debugging` — when the screenshot shows a blank page or a collapsed layout.
- `frontend-design` — the layout and responsive rules the baseline is meant to enforce.
- `css-animation` / `motion-design` — animating in a way that can be frozen for capture, and honoring reduced motion.
- `accessibility` — focus states and text scaling that the interaction-state captures protect.
- `html5-apis` — canvas/WebGL rendering, which needs its own GPU-stable capture setup.
