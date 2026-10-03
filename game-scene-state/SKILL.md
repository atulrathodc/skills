---
name: game-scene-state
description: Manage game scenes and states — loading/menu/playing/paused/gameover transitions, pausing timers, deterministic restart, and teardown that doesn't leak.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# Game Scene & State

Scenes are where games leak memory and where "pause" quietly keeps simulating. Make the state machine explicit.

1. **Write the state machine down** — loading → menu → playing → paused → gameover → (menu | restart). Name the legal transitions and refuse the rest. Most "impossible" bugs are an illegal transition (gameover firing during loading, a pause during a cutscene).
2. **Pause stops the simulation, not the rendering** — freeze the update tick, keep drawing the frozen world, and let UI/menus animate. Pausing by setting a global speed to 0 without stopping timers leaves the game logic running underneath.
3. **Game timers must pause too** — use accumulated simulation time, not wall-clock (`Date.now()` keeps advancing while paused, so a 30-second wave ends during a 5-minute pause). Same for cooldowns, spawns, and animations.
4. **Teardown is part of the scene** — on exit: unsubscribe event listeners, cancel `requestAnimationFrame`/timers/tweens, dispose textures/geometries/audio nodes, and null out references. A scene that only "goes away" visually keeps its GPU memory and callbacks — enter/exit it 20 times and watch the numbers climb.
5. **Restart deterministically — don't reload** — a restart should reset state, reseed the PRNG, and clear pools, not reload the page/binary. Reload-based restarts hide state bugs and break on web builds with caching.
6. **Modal UI must not leak play-through** — while an inventory or dialog is open, the game behind it should not accept gameplay input (or simulate, if that is the design). Explicitly gate input by state rather than hoping the player is polite.
7. **Overlays and transitions need a defined input policy** — during a fade or a level transition, decide whether input is queued, dropped, or buffered across the boundary. Undefined here means dropped inputs at the exact moment the player is mashing a button.
8. **Save at defined points, not anywhere** — a save triggered mid-transition captures a half-applied state; save at scene boundaries or explicit checkpoints, and version the save schema so an old save cannot be loaded into new code.
9. **Verify by cycling** — enter and exit every scene/state repeatedly and check memory, listener counts, and frame time; confirm pause actually freezes a timed event; confirm restart reproduces the same opening state. Then drive the real transition in a running build (`game-verification`).

## Related skills

- `game-loop-and-ecs` — the simulation that pause must actually stop.
- `game-input-controls` — clearing and gating input per state.
- `game-assets-and-loading` — the loading state, and disposing what a scene owned.
- `game-performance` — leak and stutter symptoms that scene teardown causes.
