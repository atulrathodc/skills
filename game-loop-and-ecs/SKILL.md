---
name: game-loop-and-ecs
description: Build the core game loop and entity architecture — fixed timestep vs render, delta time, accumulator, determinism, and ECS vs deep inheritance.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# Game Loop & Entity Architecture

Almost every "the physics is weird at different frame rates" bug is a loop design bug. Get this right before adding content.

1. **Separate simulation from rendering** — run logic on a FIXED timestep (e.g. 60 Hz) and render at whatever the display gives you. Variable-dt physics changes behavior per machine and is the root of jitter, tunneling, and non-reproducible bugs.
2. **Use an accumulator** — each frame: `acc += min(dt, MAX_FRAME)` (clamp to ~250 ms, or a tab-switch produces a giant catch-up that teleports everything), then `while (acc >= STEP) { update(STEP); acc -= STEP }`. Render once, passing `acc / STEP` as alpha for interpolation.
3. **Never mix units of time** — all velocities/accelerations are per-second; multiply by the fixed step, never by a raw frame delta. "It moves twice as fast on my monitor" is exactly this.
4. **Decouple input sampling from simulation** — collect input events as they arrive, consume them once per update tick. Reading "is key down" inside the loop is fine; reading "was pressed" from an event queue is what makes buffering possible.
5. **Make it deterministic if you will ever replay it** — fixed timestep, a seeded PRNG (never `Math.random()`), and a consistent iteration order over entities. Determinism is what gives you replays, netcode reconciliation, and testable simulations.
6. **Choose entities over deep inheritance** — an entity is an id; components are data; systems iterate over the components they care about. Deep `GameObject → Enemy → FlyingEnemy` trees collapse the moment a design needs a flying enemy that is also a pickup. Plain arrays of structs are a perfectly good ECS.
7. **Pool the allocation-heavy things** — bullets, particles, and damage numbers should be reused, not created and discarded. Per-frame allocation is the main source of GC stutter in JS/Dart/C# games.
8. **Pause is a game state, not a browser event** — on `blur`/`visibilitychange`, pause the simulation, mute/duck audio, and clear held input. When it resumes, do NOT feed the elapsed wall-clock time into the simulation.
9. **Verify with numbers** — log tick rate and entity counts; run the same scenario at 30, 60, and 144 fps and confirm identical outcomes. If a bug disappears when you change the frame rate, the bug is frame-dependent logic (see `game-verification`).

## Related skills

- `game-physics` — the subsystem most sensitive to timestep choice.
- `game-scene-state` — pause, menus, and teardown around the loop.
- `game-performance` — the frame budget this loop lives inside.
- `phaser-game` / `threejs-3d` — engine-provided loops and renderers.
