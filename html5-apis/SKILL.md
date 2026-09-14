---
name: html5-apis
description: Use the native browser platform APIs that Phaser, D3, Three.js and WebRTC are built on — canvas 2D, WebGL, requestAnimationFrame, DOM/events, fetch, MediaStream/getUserMedia, Web Audio, WebSocket, Workers, secure-context.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# HTML5 / Browser APIs

The platform layer underneath every canvas/WebGL/media library (Phaser, Three.js, D3, WebRTC). Get these right and the libraries mostly work; get them wrong and the failure looks like a "library bug" that isn't.

1. **Secure context first** — `getUserMedia`, `getDisplayMedia`, clipboard, Service Workers, and friends are `undefined` on plain `http://` (except `http://localhost`). If a modern API is mysteriously missing, you are on the wrong origin — serve HTTPS or localhost (see `webrtc-realtime`).
2. **Canvas 2D** — `const ctx = canvas.getContext('2d')`. A canvas has exactly ONE context type: calling `getContext('webgl')` after `getContext('2d')` returns `null` (and vice-versa). Drawing is painter's order (later draws on top); bracket transform/clip/style changes with `ctx.save()`/`ctx.restore()`.
3. **Crisp canvas on retina** — the `width`/`height` **attributes** are the drawing buffer, the CSS size is the display size. Set the buffer to `cssWidth * devicePixelRatio` and `ctx.scale(dpr, dpr)` (or size both explicitly), or everything is blurry on HiDPI screens.
4. **WebGL / WebGL2** — `canvas.getContext('webgl2') || canvas.getContext('webgl')`; `null` means no GPU/software fallback (headless CI needs `--use-gl=swiftshader`). Handle context loss: `canvas.addEventListener('webglcontextlost', e => { e.preventDefault(); /* re-init GPU resources */ })` plus `'webglcontextrestored'` — otherwise a GPU reset blanks the scene permanently.
5. **requestAnimationFrame is the only animation clock** — `const loop = t => { update(t - last); last = t; requestAnimationFrame(loop) }`. It **pauses while the tab is hidden**, and the first timestamp is not `0` — always compute a real `delta`, never assume ~16ms. `setInterval` for rendering causes tearing and burns battery (see `phaser-game`, `threejs-3d`).
6. **DPR & resize** — `devicePixelRatio` and `innerWidth/innerHeight` change on rotate/zoom/monitor-switch. Listen for `resize`/`orientationchange`, or better observe the container with `ResizeObserver`, then resize the backing buffer + camera/viewport. Fixed pixel dimensions overflow on mobile.
7. **DOM & events** — `addEventListener(type, fn, { once, passive, capture })`: `passive: true` on `touchstart`/`wheel`/`scroll` clears the scroll-blocking warning and lets the page scroll; `once` handles one-shot listeners without manual removal. Prefer **delegation** on a parent over per-node listeners for large lists/charts.
8. **Pointer Events** — unified `pointerdown`/`pointermove`/`pointerup` cover mouse + touch + pen (`event.pointerId`); `el.setPointerCapture(id)` keeps a drag alive when the cursor leaves the element. For FPS mouse-look use Pointer Lock (`el.requestPointerLock()`).
9. **fetch** — `const res = await fetch(url); if (!res.ok) throw ...; await res.json()`. `fetch` rejects only on network failure, **not** on 404/500 — you must check `res.ok`. A console "blocked by CORS" is a *server* header problem, not a client bug (see `frontend-backend-integration`).
10. **MediaStream / getUserMedia** — `await navigator.mediaDevices.getUserMedia({ audio, video })` needs a secure context + a permission grant; the returned `MediaStream` goes to `video.srcObject` (set `muted` + `playsInline` for the local preview). **Always stop tracks** (`stream.getTracks().forEach(t => t.stop())`) on teardown or the camera/mic indicator stays on (see `webrtc-realtime`).
11. **Web Audio** — `new AudioContext()` starts `suspended`; call `ctx.resume()` inside a user gesture or audio is silent. Schedule against `ctx.currentTime` (not `setTimeout`) for sample-accurate timing, connect nodes to `ctx.destination`, and `disconnect()`/`close()` on teardown.
12. **WebSocket** — `const ws = new WebSocket(url)` with `onopen`/`onmessage`/`onclose`/`onerror`. `send()` before `onopen` throws `InvalidStateError` — buffer until open. Set `binaryType = 'arraybuffer'` for binary frames. It does **not** auto-reconnect; add backoff + heartbeat (see `websocket-realtime`).
13. **Web Workers / OffscreenCanvas** — put heavy compute (physics step, parsing, image ops) in a `Worker` so it doesn't jank the render loop. `postMessage` uses structured clone (no functions/DOM nodes); transfer big buffers with the transfer list `postMessage(buf, [buf])`. `canvas.transferControlToOffscreen()` renders off the main thread.
14. **Storage** — `localStorage`/`sessionStorage` are **synchronous, string-only, ~5MB** (wrap objects in `JSON.stringify`) and can throw in private mode — wrap in try/catch. Use IndexedDB for large/structured/offline data; it's async and not origin-shared.
15. **Observers** — `IntersectionObserver` for lazy-load/visibility (far cheaper than a scroll handler), `ResizeObserver` for responsive canvas/charts, `MutationObserver` sparingly. They fire on threshold crossing, not every frame.
16. **Fullscreen & visibility** — `el.requestFullscreen()` must run from a user gesture; watch `visibilitychange`/`document.visibilityState` to pause audio/timers/network when backgrounded (rAF already stops, but `setInterval` and `<audio>` do not).
17. **Files & drag-drop** — a `<input type="file">` `File` is a `Blob`: `URL.createObjectURL(file)` for a temp URL (`URL.revokeObjectURL` when done) or `await file.arrayBuffer()`. On drop targets, `dragover` must call `preventDefault()` or the `drop` event never fires.
18. **Verify** — an API "existing" is not proof it works: drive it in a real browser and assert the effect (`canvas` non-blank, `video.videoWidth > 0`, `ws.readyState === 1`, `ctx.state === 'running'`), not merely that the constructor didn't throw (see `ui-verification`, `make-it-run`).

## Related skills
- `phaser-game` — 2D games built on canvas/WebGL + rAF + Web Audio.
- `threejs-3d` — WebGL scenes + rAF + Pointer Lock.
- `d3-visualization` — SVG/DOM + `fetch` + `ResizeObserver`.
- `css-animation` — transitions/keyframes on the DOM, GPU-friendly properties, View Transitions.
- `web-animations-api` — `element.animate()`/`getAnimations()` and scroll-driven timelines over rAF.
- `sprite-animation` — canvas `drawImage` frame stepping; delta timing without a frame-rate assumption.
- `motion-design` — duration/easing/stagger policy and the reduced-motion design decision.
- `lottie-animation` — vector/AE-exported JSON played by `lottie-web`/Rive on top of these APIs.
- `webrtc-realtime` — `getUserMedia`/`MediaStream` + WebSocket signaling.
- `websocket-realtime` — the WebSocket transport in depth.
- `static-frontend` / `react-frontend` — the page these APIs run inside.
