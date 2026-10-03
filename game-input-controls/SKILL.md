---
name: game-input-controls
description: Handle game input well — keyboard, gamepad, mouse/pointer-lock, and touch; buffering, frame independence, focus loss, dead zones, rebinding, and accessibility.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# Game Input & Controls

Controls are where players judge the whole game. Most "the controls feel bad" reports are buffering, frame-dependence, or a stuck key.

1. **Buffer input events, consume them per tick** — collect key/button events as they arrive, then read them once per simulation step. Distinguish "held" (movement) from "pressed this tick" (jump/shoot), or the same event fires on every frame it is held.
2. **Frame independence is not optional** — a jump that applies `velocity = 10` per frame jumps twice as high at 120 Hz. Scale by the fixed step, and never gate gameplay on a raw frame count.
3. **Clear held input on focus loss** — alt-tab while holding a movement key and the key-up never arrives, so the character walks into a wall forever. Clear all held keys/buttons on `blur`/`visibilitychange`/pause. This is the single most common input bug.
4. **Gamepad: the API is not free** — the Gamepad API only exposes a device after a button press (not on connect), sticks drift so you need a dead zone, and every browser reports a slightly different mapping. Support the standard mapping, then handle the rest.
5. **Pointer lock needs a user gesture and an escape hatch** — for mouse-look, request lock on a click, handle `pointerlockchange`/`error`, pause the game when the user presses Escape, and never rely on absolute cursor position while locked.
6. **Touch is not a click** — handle multi-touch (two thumbs at once), `touch-action: none` plus `preventDefault` to kill scroll/zoom/double-tap-zoom, and make on-screen control hit areas noticeably larger than their visuals. Track touch identifiers so a released finger doesn't steal another's control.
7. **Don't fight the browser** — `preventDefault` arrows/space when the canvas has focus, but leave browser shortcuts (Ctrl/Cmd+W, tab switching) alone; a game that hijacks them is broken UI.
8. **Let players rebind, and persist it** — keyboard layouts differ (WASD vs ZQSD), gamepads vary, and sensitivity/inverted-Y is a requirement for many players. Store bindings and show them; also provide a keyboard-only and a click/tap-only path for accessibility.
9. **Verify by playing the failure case** — hold a key, alt-tab away, return: no stuck movement. Two simultaneous touches: both register. Unplug a gamepad mid-game: the game does not freeze or keep a phantom input. Scripted input or manual driving is the proof (see `game-verification`).

## Related skills

- `game-loop-and-ecs` — where sampled input is consumed and why it must be per-tick.
- `game-scene-state` — clearing input on pause, menus, and focus changes.
- `game-verification` — driving the real build rather than assuming controls work.
- `accessibility` — remapping, readable UI, and non-pointer paths through the game.
