---
name: game-physics
description: Implement and debug game physics — collision detection vs resolution, broadphase, tunneling, fixed timestep, engine choice, and determinism.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# Game Physics

Physics bugs are the most visible bugs in a game: things fall through floors, stick to walls, or explode on impact.

1. **Fixed timestep, or none of it is stable** — physics integration must run at a constant step (see `game-loop-and-ecs`). Variable dt makes restitution and friction frame-rate dependent and lets fast bodies pass through thin colliders.
2. **Detection and resolution are two separate jobs** — find overlaps (broadphase → narrowphase), then resolve penetration/impulse in a defined order with a fixed number of iterations. Mixing them into one ad-hoc pass gives order-dependent, jittery results.
3. **Broadphase before you touch N²** — pairwise checks are fine for tens of bodies and fatal for thousands. A uniform grid or spatial hash handles most 2D games; use a quadtree/BVH when sizes vary wildly.
4. **Fast objects tunnel** — a bullet at high speed skips a thin wall between two ticks. Fix with continuous collision detection (swept shapes), sub-stepping the fast body, or by making the collider thick enough — in that order of preference.
5. **Don't hand-roll an engine you actually need** — AABB overlap and circle collision are fine by hand; rotation, stacking, joints, and stable resting contact are not. Use Matter.js/Rapier/Box2D (web) or the engine's built-in solver (Unity, Godot) rather than inventing sequential impulses.
6. **Respect the engine's unit scale** — Box2D and Rapier assume meters; feeding pixels makes bodies enormous, slow, and unstable. Keep one consistent scale and convert at the render boundary.
7. **Kinematic vs dynamic is a design decision** — platforms, moving hazards, and player-controlled characters are usually kinematic (you set the position); letting the solver drive them fights your own movement code.
8. **Layers, masks, and one-way platforms** — filter what can collide with what (bullets shouldn't shove the player), and implement one-way platforms as a directional check on velocity, not as a physics hack.
9. **Determinism requires control** — floating-point plus iteration order means two runs can diverge. If you need lockstep/replays, fix the step, seed randomness, and keep the update order stable; cross-platform determinism is much harder than same-machine determinism — verify, don't assume.
10. **Verify the specific failure** — drop a fast object and confirm it does not tunnel; push a character into a corner and confirm it does not jitter or stick; run the same scenario twice and diff the trace. Screenshots alone hide intermittent physics bugs.

## Related skills

- `game-loop-and-ecs` — the timestep contract physics depends on.
- `game-verification` — deterministic replay harnesses that catch physics regressions.
- `game-performance` — how many bodies you can afford to simulate.
- `multiplayer-netcode` — why an authoritative server must own the simulation.
