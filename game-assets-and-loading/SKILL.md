---
name: game-assets-and-loading
description: Load and manage game assets — preloading with progress, atlases and compression, cache busting, memory budgets, dispose, and handling failed loads.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# Game Assets & Loading

An asset pipeline problem looks like a gameplay bug: a black screen, a loading bar that never finishes, or a stutter mid-fight.

1. **Preload behind a loading screen, with real progress** — load everything a scene needs up front and show determinate progress (n of m), not a spinner. Loading during gameplay is a guaranteed frame hitch on a phone.
2. **Never load synchronously on the hot path** — a blocking decode mid-game stutters the frame and, in some engines, stalls input. Everything the player is about to need gets loaded before they need it.
3. **Batch draw calls with atlases** — a spritesheet/atlas turns hundreds of texture binds into one. Pack sprites into an atlas, leave padding between them so filtering doesn't bleed neighbouring pixels, and keep power-of-two dimensions for compatibility with older GPU paths.
4. **Compress for the target** — KTX2/Basis for large 3D textures, well-tuned PNG/WebP for 2D, and audio in compressed formats; raw assets are the most common cause of a game that takes 30 seconds to start.
5. **Cache-bust every deploy** — content-hashed filenames (or a version query) so a returning player doesn't run new code against a stale cached atlas. A stale asset in a CDN is a real, shipped, hard-to-reproduce bug — verify after a deploy, not just locally.
6. **Have a memory budget and enforce it** — decode cost is CPU and VRAM; a 4096² texture is ~64 MB uncompressed. Track it, and dispose what a scene no longer needs (`three.js`: `.dispose()`, `game-scene-state`).
7. **A failed load must be visible** — a 404 or a decoder error means the game is stuck behind an infinite loading bar, which players report as "it doesn't work". Surface the error with a retry, and never let one missing asset deadlock the boot sequence.
8. **Handle the slow path deliberately** — progress that doesn't move for 10 seconds on 3G looks frozen. Show per-asset progress, time out, and allow a low-quality start (placeholder or downscaled asset) if the design allows.
9. **Verify on a throttled connection and after a deploy** — throttle to slow 3G, hard-reload, and confirm the loading screen advances and completes; then redeploy and confirm a returning client picks up new assets rather than a cached old atlas.

## Related skills

- `game-performance` — decode, memory, and draw-call costs that start here.
- `game-scene-state` — the loading state and disposing assets on scene exit.
- `game-audio` — preloading and streaming audio specifically.
- `caching-strategies` — cache busting and staleness, which is the deploy half of this problem.
