---
name: game-performance
description: Hit a frame budget in games — frametime vs FPS, draw calls and batching, per-frame allocation and GC spikes, culling, pooling, and measuring on real phones.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# Game Performance

Games are judged at 16.6 ms. Average FPS hides the stutter players actually notice — measure your worst frames, not your best.

1. **Think in frametime, not FPS** — 60 fps is a 16.6 ms budget; 30 fps is 33 ms. Budget explicitly (e.g. ~8 ms logic, ~8 ms render) and track the 99th percentile frame, because a single 200 ms hitch is what players call "lag".
2. **Measure with a profiler and a frame HUD** — the browser/engine profiler for where time goes, plus an on-screen frametime graph during real play. Never optimize from a hunch, and never from a dev laptop's numbers.
3. **Draw calls are the usual bottleneck** — batch and instance, use atlases, avoid swapping materials/state per object, and prefer one canvas over hundreds of DOM nodes. Going from 500 draw calls to 50 beats micro-optimizing math.
4. **Allocate nothing per frame** — new vectors/matrices/arrays inside `update()` produce garbage, and garbage produces GC pauses that show up as random stutter. Reuse module-level temporaries and pool bullets/particles/enemies.
5. **Do less work per frame** — cull offscreen entities, sleep resting physics bodies, stagger pathfinding/AI across frames, and update distant objects at a lower rate. Most "slow game" problems are solved by not computing what nobody can see.
6. **Decouple simulation from render rate** — a fixed sim tick (see `game-loop-and-ecs`) plus interpolation lets you drop simulation cost without changing game behavior, and keeps a 144 Hz monitor from quadrupling logic cost.
7. **Textures and memory bound mobile hard** — a mid-tier Android phone has a fraction of a laptop's fill rate and bandwidth. Test on one, watch for thermal throttling on prolonged play, and keep the memory budget from `game-assets-and-loading`.
8. **Watch for the classic leaks** — listeners and rAF loops that were never cancelled, textures never disposed, entities removed from the world but still in an update array. Frame time climbing over minutes is a leak, not a slow machine.
9. **Verify with before/after numbers under fixed conditions** — same device, same scene, same duration, reporting frametime percentiles (p50/p99) and memory over a 10-minute session. A perf claim without a measurement is a guess, and a "win" that breaks behavior is a bug (`game-verification`).

## Related skills

- `game-loop-and-ecs` — the tick structure that makes cost controllable.
- `game-assets-and-loading` — draw calls, decode, and memory budgets.
- `game-verification` — measuring the real play session, not an idle menu.
- `performance-analysis` / `benchmarking` — the general measurement discipline, applied to frames.
