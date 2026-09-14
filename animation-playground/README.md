# Animation Playground

Runnable companion to the animation skills in this repo — a tiny zero-dependency
Node server plus a UI that lists the skills (from the API) and demonstrates each
animation type live in the browser.

The skill collection itself is documentation-only (`<skill>/SKILL.md`); this
directory is the one executable artifact and is intentionally self-contained.

## Run

```bash
node server.js          # or: npm start   (PORT=8787 by default)
```

Open <http://localhost:8787/>.

## API

`GET /api/animations` → JSON

```json
{ "count": 5,
  "animations": [
    { "name": "motion-design", "kind": "design", "layer": "Decision", "summary": "…" },
    { "name": "css-animation", "kind": "css",    "layer": "Declarative", "summary": "…" }
  ] }
```

## What the page demonstrates

| Section | Skill exercised |
|---|---|
| Skill list, staggered enter | `motion-design` (stagger, easing), `css-animation` (`@keyframes`) |
| "Replay pop" button | `css-animation` (`@keyframes`, overshoot `cubic-bezier`, `forwards`, reflow restart) |
| "Run element.animate()" | `web-animations-api` (`animate()`, `fill: 'forwards'`, `getAnimations()`, `finished`) |
| 4-frame canvas atlas | `sprite-animation` (frame math, `drawImage` source rect, ms accumulator, `imageSmoothingEnabled`) |
| `@media (prefers-reduced-motion: reduce)` | `motion-design` / `accessibility` (reduce movement, keep state changes) |

## Verify

`index.html` is read from disk on every request (no restart needed after edits).
Drive the page in a real browser and assert the behaviour, not just the markup:

- `document.querySelectorAll('#skills li').length === 5` (the API payload rendered)
- click `#run` → `document.getElementById('wabox').getAnimations()[0].playState === 'finished'`
- click `#pop` → `getComputedStyle(popbox).transform === 'matrix(1, 0, 0, 1, 0, 0)'`
- read back `getImageData` from `#sprite` twice ≥120 ms apart — the pixel must change
