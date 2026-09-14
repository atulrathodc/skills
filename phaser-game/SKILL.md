---
name: phaser-game
description: Build, run, and debug Phaser.js 2D games — Game config, Scene lifecycle, arcade physics, input, Vite dev server.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# Phaser Game

Phaser 3 specifics that trip up agents building a 2D game.

1. **Install** — `npm install phaser` (frontend-only, no backend needed). Scaffold with Vite (`npm create vite@latest . -- --template vanilla`) so `import Phaser from 'phaser'` resolves and HMR works. Read `package.json` for the exact `dev`/`build` scripts.
2. **Game config** — the whole game is one object:
   ```js
   new Phaser.Game({ type: Phaser.AUTO, width: 800, height: 600,
     parent: 'game', backgroundColor: '#222',
     physics: { default: 'arcade', arcade: { gravity: { y: 300 }, debug: false } },
     scene: [BootScene, PlayScene] })
   ```
   `type: Phaser.AUTO` picks WebGL and falls back to Canvas — do NOT hardcode `WEBGL`, it throws on machines without a GL context.
3. **Canvas must exist** — the `parent` id must be in `index.html` (`<div id="game"></div>`) BEFORE the game boots, or Phaser appends to `document.body` and CSS sizing breaks.
4. **Scene lifecycle** — `preload()` (queue assets) → `create()` (build the world) → `update(time, delta)` (per-frame). Assets are only ready in/after `create()`; loading an image in `create()` and drawing it immediately = a blank/`__MISSING` texture.
5. **Asset loading** — `this.load.image('player', 'assets/player.png')`, `this.load.spritesheet(key, url, { frameWidth, frameHeight })`, `this.load.audio`, `this.load.json`. Paths are relative to the served root — a 404 in the console is a path bug, not a Phaser bug (see `static-frontend` for path rules).
6. **Creating objects** — `const p = this.physics.add.sprite(100, 100, 'player')` (arcade) or `this.add.image(...)` for non-physics. Use `this.add.text(x, y, 'hi')` for HUD text with `{ fontFamily, fontSize, color }`.
7. **Physics: arcade vs matter** — `arcade` = axis-aligned, fast, the default choice. `matter` = full rigid-body (rotation, collision shapes, constraints) and needs `physics: { default: 'matter' }` plus `this.matter.add.sprite(...)`. Mixing `this.physics.add` with matter bodies silently does nothing.
8. **Arcade gotchas** — set `body.setCollideWorldBounds(true)` or sprites fly off-screen; gravity only applies to dynamic bodies, not `this.add.image`; land on the ground with `this.physics.add.collider(player, platforms)`, not manual `if` checks.
9. **Input** — `this.input.keyboard.createCursorKeys()`, `this.input.keyboard.addKeys('W,A,S,D')`, or `this.input.on('pointerdown', ...)`. Rebuild key objects per scene; keys from a stopped scene are dead. Set velocity (`body.setVelocityX(160)`) rather than mutating `x` directly when using physics.
10. **Animations** — define once with `this.anims.create({ key: 'run', frames: this.anims.generateFrameNumbers('player', { start: 0, end: 3 }), frameRate: 10, repeat: -1 })` then `sprite.play('run')`. Creating the same anim key twice in a hot path causes a "Animation key already exists" warning and the first definition wins.
11. **Scene switching** — `this.scene.start('PlayScene')` shuts down the current scene (its update stops); `this.scene.launch('HudScene')` runs a scene alongside (use it for HUD). `this.scene.restart()` for a game-over retry.
12. **Cleanup/listeners** — bind `this.scene.events.on('shutdown', ...)` or `once` for anything registered outside Phaser (raw `window` listeners, intervals) so a restart doesn't stack duplicates.
13. **Scale/responsive** — add `scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH }` so the canvas fits its container instead of overflowing on resize.
14. **Run it** — start Vite in the background (`npm run dev`) and open the URL. Phaser games render to a `<canvas>`, so `curl` only proves the HTML shell; the real check is the browser.
15. **Verify in the browser** — load the page with the browser tool and assert: a `<canvas>` exists with non-zero width/height, the screenshot is not a blank/uniform color, and the console has **no errors** (`Phaser` load failure, missing-asset 404s, or "Cannot read properties of undefined" in `create()`). Then interact (arrow key / click) and screenshot again to prove `update()` is running (see `ui-verification`, `make-it-run`).
16. **Debug overlay** — set `arcade: { debug: true }` to draw body outlines; a sprite with no outline has no physics body attached, which is the usual cause of "gravity doesn't work".
17. Tweens/effects — `this.tweens.add({ targets: sprite, x: 400, duration: 600, ease: 'Cubic.easeOut' })` for code-driven motion (complements `this.anims` frame animation); tweens are per-object and are killed with the scene, so re-adding one each frame stacks duplicates.
18. A page that "compiles" is not done — the canvas must render and the console must be clean.

## Related skills
- `sprite-animation` — the sprite-sheet/atlas frame math and fps-independent timing behind `this.anims`.
- `html5-apis` — the canvas/WebGL/rAF/Web Audio platform Phaser runs on.
- `threejs-3d` — the 3D counterpart when the game leaves 2D.
- `css-animation` — animating the DOM HUD/menus around the canvas.
- `motion-design` — game-feel/cadence choices (durations, easing, feedback).
- `ui-verification` / `make-it-run` — drive the page and prove the canvas animates.
