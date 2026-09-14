---
name: sprite-animation
description: Build 2D frame-by-frame sprite animation — sprite sheets and texture atlases, canvas drawImage source-rect stepping, frame timing decoupled from frame rate, flipbooks, pixel-art crispness, and engine usage (Phaser anims, PixiJS AnimatedSprite).
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# Sprite Animation

Frame animation is arithmetic, not a library feature: an index into a grid, advanced by elapsed time. Most "the animation is too fast / freezes / shows the wrong frame" bugs are index or timing bugs, not rendering bugs.

1. **A sprite sheet is a grid — know the frame math** — a sheet of `cols × rows` frames each `frameWidth × frameHeight` (from the atlas JSON or the artist's spec). Frame `i` sits at source rect `sx = (i % cols) * frameWidth`, `sy = Math.floor(i / cols) * frameHeight`. Hardcoding `sx = i * frameWidth` breaks as soon as there is more than one row — the classic "it slides sideways through the wrong frames" bug.
2. **Canvas drawing is `drawImage` with 9 args** — `ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh)` (source rect → dest rect). All four are required for a frame; the 3-arg/5-arg forms draw the whole image. The image must be **loaded** (`img.onload`) before the first `drawImage`, or you get nothing and no error — gate the loop on `img.complete`.
3. **Clear before you draw a frame** — `ctx.clearRect(0, 0, w, h)` (or `ctx.drawImage` a full background) at the top of each frame, or the moving sprite smears into a trail. Only clear the dirty region if you're optimising, and then clear *before* drawing the new frame, not after.
4. **Frame timing must be independent of frame rate** — drive the frame index from an **accumulator of elapsed milliseconds**, never `frame++` per rAF tick:
   ```js
   function step(now) {
     const dt = now - last; last = now;
     accum += dt;
     if (accum >= msPerFrame) { frame = (frame + 1) % frameCount; accum -= msPerFrame; }
     draw(frame);
     requestAnimationFrame(step);
   }
   ```
   A `frame++`-per-tick loop plays at 60fps on a desktop and 30fps on a slow phone — the same animation, two speeds. `msPerFrame = 1000 / fps`, and advance by a **`while`/modulo against the overflow `accum`**, not `accum = 0`, or the animation loses the remainder and drifts slower than declared.
5. **Never advance by the raw rAF timestamp** — the first `now` is not `0` and does not start at a multiple of your frame time, so `Math.floor(now / msPerFrame) % frameCount` starts mid-animation and stutters when the tab is throttled. Always compute a real delta first (`dt` above). Clamp a huge `dt` (tab-away spike) so the sprite doesn't fast-forward through 200 frames on return (see `html5-apis`).
6. **Pixel art must not be smoothed** — set `ctx.imageSmoothingEnabled = false` (and CSS `image-rendering: pixelated; /* fallback: crisp-edges */`) or the browser bilinear-blurs the upscaled frames. Draw at integer source/dest coordinates (round `dx`/`dy` and the camera offset) — sub-pixel positions produce shimmering, half-transparent edge pixels.
7. **Retina canvas** — the drawing buffer is `width/height`; the CSS size is separate. Size to `w * devicePixelRatio` and `ctx.scale(dpr, dpr)` (or draw in device pixels) so frames are crisp on HiDPI; a 1× buffer stretched to CSS pixels looks like a blurry sprite sheet (see `html5-apis`).
8. **Clips: loop vs one-shot** — looping animations wrap the index (`(i + 1) % n`); one-shot animations **must clamp** (`i = Math.min(i + 1, n - 1)`) and fire the `onComplete` **once** (guard with a `done` flag) — a `%` on a death/attack animation makes it loop forever, the classic "the explosion never stops" bug.
9. **Defining a clip = a name + a frame range + fps** — keep frames contiguous within a row where possible and store `{ key, start, end, fps, loop }`; non-contiguous frames (e.g. 0,2,5) need an explicit index array. In **Phaser**: `this.load.spritesheet('hero', 'hero.png', { frameWidth: 32, frameHeight: 32 })` then `this.anims.create({ key: 'run', frames: this.anims.generateFrameNumbers('hero', { start: 0, end: 5 }), frameRate: 12, repeat: -1 })` and `sprite.play('run')`. In **PixiJS**: `new AnimatedSprite(textures)` with `animationSpeed` (note: Pixi's speed is *frames per tick*, NOT fps — set `animationSpeed = fps / 60`) and `sprite.play()`.
10. **Textures come from an atlas, one image** — prefer a single packed atlas + a JSON (`TexturePacker`/`free-tex-packer` output: `{"frames":{"hero_0":{"frame":{"x":0,"y":0,"w":32,"h":32}}}}`) over N separate files: one HTTP request, no per-file 404s, and the frames are already cropped. Loading sprites via `new Image()` per frame scales the request count with the animation length and will visibly pop in over a slow network.
11. **Flipbook / filmstrip** — a horizontal strip of `n` frames can be played **without canvas code** by animating `background-position-x` in `steps(n)` (CSS) or moving `sprite.x` across an atlas region. This is `steps()` timing, not a smooth interpolation — `animation: flip 1s steps(8) infinite` shows 8 discrete frames (see `css-animation` §6).
12. **Anchoring and hitboxes** — a sprite's origin (`setOrigin(0.5, 1)` in Phaser, `anchor.set(0.5, 1)` in Pixi) determines rotation/flip pivot; flip with `flipX`/`scale.x = -1` rather than a second mirrored sheet. Because every frame shares one rect, the **physics body must not change size per frame** — a per-frame body resize makes collisions jitter and can push the entity through floors.
13. **Culled / off-screen sprites still cost** — draw only frames whose dest rect intersects the viewport (or put them in an engine that culls). A level with 5,000 animated tiles drawn every frame drops frames regardless of how good your timing is; static tiles belong in one pre-rendered/tiled background layer.
14. **Decode off the main thread for big sheets** — a large sprite atlas PNG decodes on the main thread and blocks the first animation frames. `createImageBitmap(blob)` (async, OffscreenCanvas-friendly) avoids the jank; `img.decode()` is the smaller win (see `html5-apis`).
15. **Verify** — in the browser tool, assert the *rendered frame pixels*, not just that a canvas exists: read back `ctx.getImageData()` (non-transparent, non-uniform) at two moments ≥ a frame apart and confirm they differ, step one frame by seeking your index, and assert `drawImage` was called with a source rect inside the sheet (`sx + sw <= img.width`). A sheet with `naturalWidth/Height` equal to the frame size means only the first frame loaded (wrong path/size); a uniform read-back means the canvas was never cleared/drawn (see `ui-verification`, `make-it-run`).

## Related skills
- `phaser-game` — Phaser's `load.spritesheet` + `anims.create`/`generateFrameNumbers`, physics + origins.
- `threejs-3d` — the 3D equivalent: skeletal/clip animation via `AnimationMixer`, and texture atlases for particles.
- `html5-apis` — canvas 2D, `requestAnimationFrame` delta timing, DPR, `createImageBitmap`.
- `css-animation` — `steps()` flipbook timing and `image-rendering: pixelated`.
- `motion-design` — frame rate/feel choices for character and UI motion.
- `d3-visualization` — SVG/canvas rendering trade-offs when a visualiser also needs sprite-like motion.
- `ui-verification` / `make-it-run` — prove the frames actually change at runtime.
