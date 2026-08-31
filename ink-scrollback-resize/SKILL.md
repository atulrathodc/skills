---
name: ink-scrollback-resize
description: Fix Ink text duplication on terminal resize — freeze the first-seen width in Static and pinned-chrome renderers, and patch Ink's output/ink internals.
allowed-tools:
  - Bash
  - Read
  - Edit
  - Write
---

# Ink native scrollback & resize duplication

## Architecture (typical log/transcript TUI)
- **Native scrollback mode**: finalized output is appended to the terminal's OWN scrollback
  via Ink `<Static>`. A pinned bottom chrome (status line, dividers, prompt) is regular
  (non-Static) Ink content rendered AFTER the `<Static>` rows in a bottom `Box`.
- **Fullscreen app-scroll mode**: a virtualized viewport scrolled by the app instead of the
  terminal — no native scrollback.

## Why text DUPLICATES on resize (native mode)
Ink `<Static>` and pinned chrome are append-and-erase writers into the terminal's scrollback.
Rows already flushed into native scrollback CANNOT be erased. When the terminal resizes,
the live width changes and re-wraps content to a different line count; Ink re-emits the
wrapped rows on top of the already-flushed ones → duplicate/overlapping text (e.g. stacked
status + divider lines at shifting column offsets).

## The fix pattern (extend it — do NOT invent a new one)
Freeze the FIRST-SEEN width in each app-owned renderer so a resize produces an IDENTICAL
(empty-diff) frame and Ink writes nothing:

```ts
const [stableWidth] = React.useState(() => Math.max(20, width));
```

Apply it to:
- `History` (transcript `<Static>`) — pass `stableWidth` to each message bubble.
- `LiveRegion` (streaming/live cards) — same pattern.
- The pinned chrome — compute one `chromeWidth` once and pass it (NOT the live `width`) to
  the status line, dividers, and prompt/bottom rows. Freezing the chrome width stops it
  re-wrapping → no re-emission → no duplicate.

## Verification / tests
- The transcript must appear EXACTLY once in the accumulated buffer across many resizes
  (raw-buffer count works for `<Static>` because it's append-only).
- The chrome divider's dash-run (its width) must be CONSTANT across resizes — this catches
  the chrome re-wrap symptom.
- Caveat: fake stdout `clearLine/cursorTo/moveCursor` are no-ops, so the raw buffer contains
  erase bytes (`\x1b[2K\x1b[1A`) that clear cells on a real terminal. A raw count of CHROME
  lines is therefore NOT a valid visible-duplication signal — assert on width stability or
  transcript (Static) uniqueness instead.
- Build before running tests: `npm run build`, then run the resize/duplication tests.

## Ink patches (build step, idempotent)
- `output.js`: clamp render dims to `maxH=5000, maxW=500` to avoid a Yoga infinite-loop crash.
- `ink.js`: `outputHeight >= rows` → `outputHeight > rows` so exactly-filling content uses
  in-place erase instead of full screen+scrollback clear (`\x1b[2J\x1b[3J\x1b[H`), which
  some terminals handle imperfectly and can itself cause chrome duplication.
