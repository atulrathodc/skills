---
name: game-verification
description: PROVE a game is actually playable before done() — drive the real build through its core loop, check determinism with a replay harness, and rule out black screen, stuck loading, silent audio, stuck input, and leaks.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# Game Verification

**A game is not done because it builds, because the assets load, or because unit tests pass.** It is done when someone can actually play the core loop in a real build and the expected thing happens.

1. **Drive the ACTUAL core loop in a running build** — start it, get into gameplay, perform the loop the task is about (move, shoot, score, level up), and observe the state change. "The dev server serves `index.html`" and "the scene rendered once" are not a playtest. Capture a screenshot or short recording of the result.
2. **Check the boring failure modes first — they cause most "it doesn't work" reports:**
   - **Black screen** → WebGL/context or asset failure; read the console, not the canvas.
   - **Stuck on loading** → one asset 404'd and the loader never resolved (see `game-assets-and-loading`).
   - **No audio** → the autoplay policy, not a missing file; audio only starts after a user gesture.
   - **Stuck input** → a key held across a focus change never got its key-up.
   - **Frozen but "running"** → a paused simulation or a dead update loop, still rendering.
3. **Build a determinism harness** — fixed step, seeded PRNG, scripted input sequence, run headless, and assert the resulting state (score, positions, RNG draws). This is the only practical way to catch physics/loop regressions and the reason determinism is worth designing for (`game-loop-and-ecs`).
4. **Test the simulation headless, render on a device** — run game logic in CI without a GPU (fast, catches rule bugs), then do a real browser/device run for rendering, input, and audio. Logic tests cannot see a shader that fails to compile.
5. **Measure during real play, not on an idle menu** — frametime percentiles (p50/p99) and memory across a 10-minute session with effects firing. An idle menu is the easiest frame the game will ever render (`game-performance`).
6. **Play the edges the happy path skips** — pause mid-animation and resume, alt-tab while holding movement, restart twice, resize/fullscreen mid-scene, throttle the network to 3G, and enter/exit a scene 20 times watching memory. Each of these is a bug class, not a formality.
7. **Two players for anything networked** — netcode verified with one client is not verified: confirm agreement, no rubber-banding at rest, and reconnection mid-match (`multiplayer-netcode`).
8. **State exactly what you verified** — the seed, the input script, the device/browser, and the observed result. "Played it and it felt fine" is not a report; "ran the 60-tick scripted input at seed 42 on a mid-tier Android device, score 1200, no frame above 33 ms" is.
9. **Never call `done()` on a build + a green test suite.** If you did not enter gameplay and exercise the feature, it is unverified — say so plainly rather than implying it works.

## Related skills

- `runtime-verification` / `make-it-run` — the language-agnostic completion mandate this specializes for games.
- `game-loop-and-ecs` / `game-physics` — determinism, which the harness depends on.
- `game-performance` — the measurements a real play session must produce.
- `phaser-game` / `threejs-3d` / `game-input-controls` — driving the specific build and its controls.
