---
name: ink-logupdate-erase
description: Patch Ink's log-update erase to be cursor-relative and viewport-clamped — the correct frame erase after a terminal resize-grow, without ghost scrollback rows.
allowed-tools:
  - Bash
  - Read
  - Edit
  - Write
---

# Ink log-update erase: cursor-relative, viewport-clamped

Ink's `node_modules/ink/build/log-update.js` erases the previous frame before writing the
next one. The CORRECT erase is:

```js
stream.write(eraseLinesViewport(previousLineCount, stream.getWindowSize()[1]) + output);
```

with NO `ansiEscapes.cursorTo(0, rows - 1)` anchor before the erase.

## Why

- `previousLineCount = output.split('\n').length` (the ORIGINAL split length — do NOT
  subtract 1). The trailing newline's empty array element is correct for a cursor-relative
  erase; dropping it makes the erase one line short.
- A forced `cursorTo(0, rows - 1)` anchor is WRONG after a resize that GROWS the terminal.
  The terminal appends blank rows below the previous chrome, so the chrome is no longer at
  the bottom of the viewport. Erasing from `rows - 1` blanks the wrong rows and leaves the
  previous chrome in the grid; the next `<Static>` append then scrolls that stale chrome
  into native scrollback as a ghost row.
- `eraseLinesViewport(count, rows)` CLAMPS the count to the live viewport so a frame taller
  than the terminal never emits `\x1b[<N>A` with `N > rows` (real terminals clamp the move
  at row 1, which misses the rows scrolled off the top).

## Applying the patch

Patch `log-update.js` (or your build step) so the frame write is exactly the
cursor-relative erase above. Keep the patch idempotent so re-running the build doesn't
double-patch.

## Verification

The failing mode shows up as duplicated transcript/chrome rows (the "session integrity"
ghost) after a resize-GROW. In the mini repo the gate is:

```bash
npm run build && node --test test/resizeDuplication.test.ts test/scratch-vt.test.mjs test/chromeDuplicate.test.mjs test/chromeStackedResize.test.ts test/paletteChromeDuplicate.test.ts test/liveStatusSingleton.test.mjs test/nativeScrollback.test.ts test/mouseSelection.test.mjs test/explore-dock-release.test.ts test/transcriptLayout.test.mjs test/scrollAnchorDuplicate.test.mjs test/clearRepopulate.test.mjs test/sessionIntegrity.test.mjs
```
