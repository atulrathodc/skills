---
name: threejs-3d
description: Build, run, and debug Three.js 3D/WebGL scenes — Scene/Camera/Renderer, render loop, lights, OrbitControls, GLTFLoader, animation (AnimationMixer, clips, morph targets, keys) and real-world PBR objects (procedural geometry, textures, HDRI/PMREM environment, units, instancing).
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# Three.js 3D

Three.js / WebGL specifics that trip up agents building a 3D scene. Items 1–17 are the scene basics (setup, loop, lights, controls, loading, dispose); the **Animation** section covers playing clips from GLTF or code; the **Real-world objects** section covers building/looking-real objects (PBR, textures, IBL, units, instancing).

1. **Install** — `npm install three` (plus `npm i -D vite` or use an existing bundler). Three.js is ESM-first since r150+; a bare `<script src="three.min.js">` from an old CDN gives downloads/`THREE is not defined`. Serve via a dev server, never `file://` (module + asset loads fail).
2. **The three pieces** — `Scene` (the graph), `Camera` (`PerspectiveCamera(fov, aspect, near, far)`), `Renderer` (`WebGLRenderer({ antialias: true })`). Nothing renders until all three exist and the loop calls `renderer.render(scene, camera)`.
3. **Attach the canvas** — `document.getElementById('app').appendChild(renderer.domElement)`. `WebGLRenderer` creates its `<canvas>` but never mounts it, so a scene that "does nothing" usually has an orphan canvas. Size with `renderer.setSize(w, h)` — set before or after append, but it must match the container.
4. **The animation loop** — `renderer.setAnimationLoop(() => { /* update */ renderer.render(scene, camera) })` (preferred; it is XR-safe) or `requestAnimationFrame(animate)`. A single `render()` call draws one frame and then you see nothing moving; forgetting to render inside the loop = black canvas.
5. **Aspect + resize** — on `window.addEventListener('resize', ...)`: update `camera.aspect = w/h`, call `camera.updateProjectionMatrix()` (skipping this stretches the scene), and `renderer.setSize(w, h)`. Optionally `renderer.setPixelRatio(Math.min(devicePixelRatio, 2))` to avoid blurry-but-slow rendering on retina.
6. **Geometry + material = mesh** — `new THREE.Mesh(new THREE.BoxGeometry(1,1,1), new THREE.MeshStandardMaterial({ color: 0x44aa88 }))`, then `scene.add(mesh)`. In r155+ `useLegacyLights` defaults changed, so a `MeshStandardMaterial` with **no light in the scene renders pure black** — add a light.
7. **Lights** — `new THREE.AmbientLight(0xffffff, 0.5)` + `new THREE.DirectionalLight(0xffffff, 1)` (position it: `light.position.set(5,5,5)`). Only `MeshStandardMaterial`/`MeshPhysicalMaterial` react to lights; `MeshBasicMaterial` ignores them entirely (if basic "works" and standard is black, it's the lights).
8. **Camera position** — `camera.position.set(0, 0, 5)` then `camera.lookAt(0,0,0)`. Default camera sits at the origin *inside* geometry, so a fresh scene looks empty until you move it.
9. **OrbitControls import path** — the addons are NOT in the core bundle: `import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'` (include the `.js`; the `three/addons/` alias only works with an import map). In the loop call `controls.update()` when damping is enabled.
10. **GLTFLoader** — `import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'`, then `new GLTFLoader().load('/models/x.glb', gltf => scene.add(gltf.scene), undefined, err => console.error(err))`. **Always pass the error callback** — without it a bad path fails silently and the scene is just empty. Paths are relative to the served root, and `.glb` needs the server to send the right MIME type.
11. **Loading is async** — the model appears a frame or more later; code that reads `gltf.scene.position` right after `load()` sees `undefined`. Do post-load work inside the callback.
12. **Coordinates/clipping** — everything outside the camera frustum is invisible: check `near`/`far` (`new PerspectiveCamera(75, aspect, 0.1, 1000)`), and scale your model (`mesh.scale.set(0.01,0.01,0.01)`) if it was exported in centimeters. A too-small `far` clips your model out of existence.
13. **Transforms** — `position`, `rotation` (radians, or use `.rotation.x = Math.PI/2` not degrees), `scale`. Order matters: rotation is applied around the object's origin, so model off-center geometry spins oddly — offset the child mesh under a parent `Group` instead.
14. **Shadows** — must be opted into three ways: `renderer.shadowMap.enabled = true`, `light.castShadow = true`, `mesh.castShadow = true` (and `receiveShadow` on the floor). Missing any one = no shadow, no error.
15. **Dispose on teardown** — `geometry.dispose()`, `material.dispose()`, `renderer.dispose()`, and cancel the loop (`renderer.setAnimationLoop(null)`) when a component unmounts; leaking renderers across HMR reloads shows up as "WebGL context lost" after a few saves.
16. **Common errors** — `THREE.WebGLRenderer: Error creating WebGL context` = the headless/CI browser has no GPU (run with `--use-gl=swiftshader` / `--enable-unsafe-swiftshader`, or accept software rendering); `Failed to resolve module specifier "three"` = missing bundler/import map; `THREE.GLTFLoader is not a constructor` = the addon file wasn't actually imported.
17. **Verify** — start the dev server (`npm run dev`), open the page with the browser tool and assert: a `<canvas>` exists with non-zero width/height, the console has **no WebGL/module errors**, and the screenshot is not a uniform black/blank frame (a solid color is a render or light bug). Read back scene state with an `js` op (`renderer.info.render.calls > 0` proves frames are actually drawn) and drag to confirm OrbitControls responds (see `ui-verification`, `make-it-run`).

## Animation — nothing animates by itself

The single rule that explains most "it's loaded but nothing moves" reports: a mixer only advances when you call `mixer.update(delta)` with a delta in **seconds**.

18. **Three ways things move** — (a) `AnimationMixer` for clip-based/skeletal animation from GLTF/FBX (`gltf.animations`), (b) plain per-frame math in the loop (`mesh.rotation.y += delta`), (c) a tween library (`@tweenjs/tween.js`, GSAP) for one-off transitions. Do **not** mix clip playback and hand-mutated transforms on the same node: the mixer writes that transform every frame, so your write is overwritten or jitters.
19. **The mixer is driven by you** — `const mixer = new THREE.AnimationMixer(gltf.scene); const action = mixer.clipAction(gltf.animations[0]); action.play();` then, in the loop, `mixer.update(delta)`. A model that imported fine but never moves is almost always a missing `mixer.update(delta)` or a missing `action.play()`.
20. **delta comes from a `THREE.Clock` and is in SECONDS** — `const clock = new THREE.Clock(); const delta = clock.getDelta();`. Passing the rAF timestamp (~16.7 per frame) or a `Date.now()` diff (milliseconds) makes everything run ~1000x too fast ("the animation plays at insane speed"); passing a hardcoded `1/60` makes speed depend on the machine's frame rate.
21. **Never call two Clock readers in one frame** — `getDelta()` and `getElapsedTime()` both consume the clock's internal old-time, so calling both makes one return `0` (symptom: the animation freezes on alternating frames). Call `getDelta()` once per frame and track your own `elapsed += delta`.
22. **The canonical loop** —
    ```js
    const clock = new THREE.Clock();
    renderer.setAnimationLoop(() => {
      const delta = Math.min(clock.getDelta(), 0.1);   // clamp the tab-away spike
      mixer.update(delta);
      controls.update();
      renderer.render(scene, camera);
    });
    ```
    `setAnimationLoop((time) => …)` passes `time` in **milliseconds, absolute since page load** — never feed it to `mixer.update` (that is the "animation finishes instantly / jumps around" bug).
23. **Tab-away spike** — rAF stops while the tab is hidden (see `html5-apis` §5), so the first delta on return can be several seconds and every animation teleports. Clamp (`Math.min(delta, 0.1)`) and/or pause on `document.visibilitychange`.
24. **Clips live on the file, not the scene** — GLTF clips are in `gltf.animations` (`AnimationClip[]`); `gltf.scene.animations` is usually empty. Log `gltf.animations.map(c => c.name)` in the load callback — that list is your menu, and clip **names** are what a state machine switches on.
25. **Binding is by node NAME, relative to the mixer root** — a clip's tracks target paths like `Armature/Hips.position`, so the object passed to `new THREE.AnimationMixer(root)` must contain those names verbatim. Renaming nodes (or passing a sub-mesh instead of the loaded root) logs `THREE.PropertyBinding: No target node found for track: …` and animates nothing — read that warning, it names the exact node.
26. **One-shot clips** — `action.setLoop(THREE.LoopOnce, 1); action.clampWhenFinished = true;` (clamping holds the last pose instead of snapping back to rest). The alternatives are `THREE.LoopRepeat` (default, `Infinity`) and `THREE.LoopPingPong`.
27. **Know when it ended** — `mixer.addEventListener('finished', e => { /* e.action */ playIdle(); })`. A finished, clamped `LoopOnce` action is **not** replayable with a bare `.play()`: rewind first (`action.reset().play()`, or `action.time = 0; action.paused = false`).
28. **Crossfade between clips** — the standard pattern (both actions must be playing for the fades to blend):
    ```js
    function fadeTo(name, dur = 0.3) {
      const next = actions[name];
      if (next === current) return;
      next.reset().setEffectiveTimeScale(1).setEffectiveWeight(1).fadeIn(dur).play();
      current.fadeOut(dur);
      current = next;
    }
    ```
    `next.crossFadeFrom(current, dur, true)` is the one-liner (`warp = true` syncs playback speed during the blend).
29. **Action knobs** — `action.timeScale` (`1.5` fast-forward, `-1` plays the clip backwards), `action.weight` / `setEffectiveWeight()`, `action.enabled`, `action.paused`, `action.time` (seconds into the clip), and `mixer.timeScale` for global slow-motion.
30. **Build actions once, not per frame** — `mixer.clipAction(clip)` is cached per (root, clip), but calling `clipAction(...).reset().play()` *inside* the render loop restarts the clip every frame, which looks like a permanently frozen first frame. Build an `actions = {}` map in the load callback and switch state only on events.
31. **Skinned clones need `SkeletonUtils`** — a plain `gltf.scene.clone()` shares (and corrupts) the skeleton, leaving the clone stuck in bind pose. Use `import { clone as cloneSkeleton } from 'three/examples/jsm/utils/SkeletonUtils.js'`, and give each clone its **own** `AnimationMixer`.
32. **An animated skinned mesh that disappears** — its bounding volume comes from the bind pose, so a big animation sweeps outside it and frustum culling hides the character. Set `skinnedMesh.frustumCulled = false`.
33. **Morph targets (facial/cloth)** — clips animate `mesh.morphTargetInfluences[i]`, and you can also drive them by hand: `mesh.morphTargetInfluences[mesh.morphTargetDictionary['smile']] = 0.5` (0..1, clamped). Track names are `Name.morphTargetInfluences[0]`, so the mixer root must be (or contain) that named mesh — renaming the node or rooting the mixer elsewhere breaks the binding (see §25).
34. **Hand-built clips with `KeyframeTrack`** — no GLTF required:
    ```js
    const clip = new THREE.AnimationClip('bob', 1, [
      new THREE.VectorKeyframeTrack('.position', [0, 0.5, 1], [0,0,0,  0,0.3,0,  0,0,0]),
      new THREE.QuaternionKeyframeTrack('.quaternion', [0, 1], q0.toArray().concat(q1.toArray())),
      new THREE.NumberKeyframeTrack('.material.opacity', [0, 1], [1, 0]),
    ]);
    new THREE.AnimationMixer(mesh).clipAction(clip).play();
    ```
    Track names are property paths **relative to the mixer root** (`.position` = the root itself); use `ColorKeyframeTrack` for `Color`s and `BoolKeyframeTrack` for booleans, keep `duration` equal to the last time, and slice long clips with `THREE.AnimationUtils.subclip(clip, 'run', startFrame, endFrame, fps)`. Quaternions slerp; positions interpolate linearly unless you set `track.setInterpolation(THREE.InterpolateDiscrete)` for stepped motion.
35. **Many objects, one clip → `AnimationObjectGroup`** — `const group = new THREE.AnimationObjectGroup(a, b, c); const mixer = new THREE.AnimationMixer(group); mixer.clipAction(clip, group).play()` drives all of them from one action. The `clipAction(clip, root)` overload is the general way to bind a clip to a root other than the mixer's own.
36. **Tweening non-skeletal things** — `npm i @tweenjs/tween.js`, then call `tween.update()` inside the loop (it needs the timestamp), or `gsap.to(mesh.position, { x: 5, duration: 1 })` (GSAP runs its own ticker — do not also mutate that property). Tween a parent `Group` for camera moves and go through `Vector3.set` / `Quaternion.slerp` rather than assigning Euler angles that fight the existing rotation order.
37. **Update order** — apply your own transforms first, then `mixer.update(delta)`, then `controls.update()` when damping is on, then `renderer.render()`. A mixer updated *after* render shows a one-frame lag; `controls.update()` before user input is applied fights damping.
38. **Cleanup on unmount/HMR** — `mixer.stopAllAction(); mixer.uncacheRoot(root); renderer.setAnimationLoop(null);` plus geometry/material disposal (§15). Old mixers keep ticking and cloned skeletons leak, which surfaces as `WebGL context lost` after a few hot reloads.
39. **Debug an animation that is loaded but invisible** — assert `action.isRunning()`, print `action.time` / `mixer.time`, and print the expected path with `THREE.PropertyBinding.parseTrackName(clip.tracks[0].name)`; check the console for `PropertyBinding` warnings (they name the missing node) and remember a clip can target a node that exists but has `weight = 0` (§29).
40. **Verify animation at runtime** — in the browser tool probe `mixer.time` twice ~500 ms apart and assert it **increased**, assert `action.isRunning() === true`, then screenshot twice and confirm the pose changed — one screenshot proves rendering, not animation (see `ui-verification`, `make-it-run`).

## Real-world object creation — build it at real scale, with real materials

Believable objects come from four things: real units, PBR materials, correct texture color space, and image-based lighting. Get those right and procedural primitives read as real.

41. **Work in real units** — 1 unit = 1 metre: door 2.0, human 1.7, table 0.75, mug 0.1. Then `camera.near = 0.1`, `far = 100` (or sized to your world) — a scene built in centimetres makes `near`/`far`, shadow bias and light decay all behave wrong. Lights follow physical units too (physically-correct lighting has been the default since r155): `PointLight`/`SpotLight` `intensity` is candela with `decay = 2`, so a table lamp ~1 m away needs intensity in the tens-to-hundreds, while `DirectionalLight`/`AmbientLight`/`HemisphereLight` stay in the 0–5 range.
42. **Primitives are the vocabulary** — `BoxGeometry(w, h, d)`, `SphereGeometry(r, widthSegments, heightSegments)`, `CylinderGeometry(rTop, rBottom, h, radialSegments, heightSegments, openEnded)`, `ConeGeometry`, `TorusGeometry(r, tube, radialSeg, tubularSeg)`, `PlaneGeometry(w, h, wSeg, hSeg)` (segments matter for displacement/vertex work), `CapsuleGeometry(radius, length, capSeg, radialSeg)`, `CircleGeometry`, `RingGeometry`. Use `openEnded: true` on cylinders whose caps are never visible.
43. **Segment counts are a budget** — the default `SphereGeometry` (32×16, ~1k tris) is fine, but 64 radial segments × 500 props is not. 6–12 radial segments on small objects is invisible and cheap; raise them only on hero geometry.
44. **Swept/lathe forms make real shapes** — `LatheGeometry(points, segments)` rotates a 2D profile around Y (vases, bowls, lamps, table legs): points are `Vector2` with **x > 0** (x is the radius, y the height). `ExtrudeGeometry(shape, { depth, bevelEnabled, bevelThickness, bevelSize, bevelSegments, curveSegments, steps })` turns a flat `THREE.Shape` into a solid (plates, brackets, signage, walls with cutouts). `TubeGeometry(curve, tubularSegments, radius, radialSegments, closed)` sweeps a round section along a `Curve` (pipes, cables, rails).
45. **`THREE.Shape`/`Path` for custom profiles** — `const s = new THREE.Shape(); s.moveTo(0,0); s.lineTo(1,0); s.quadraticCurveTo(1,1,0,1); s.bezierCurveTo(…); s.absarc(0.5,0.5,0.2,0,Math.PI*2); s.holes.push(holePath);` — `holes` are `Path` objects (winding is normalised for you). Use `ShapeGeometry(shape)` for the flat 2D face only; `SVGLoader` hands you shapes ready to extrude (§60).
46. **`BufferGeometry` by hand when nothing fits** —
    ```js
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));  // 3 floats per vertex
    g.setIndex(indices);                                                     // triangles, CCW = front face
    g.computeVertexNormals();                                                // REQUIRED for lighting
    ```
    A hand-built mesh that renders black or invisible is (a) missing normals, (b) clockwise winding with the default `side: THREE.FrontSide` (set `material.side = THREE.DoubleSide` to confirm that diagnosis), or (c) missing a `uv` attribute while the material has a `map`.
47. **Compound objects = `Group`** — `const chair = new THREE.Group(); chair.add(seat, ...legs); chair.position.set(2, 0, -1); scene.add(chair);`. Transforms nest: move/rotate/scale the `Group` and keep children in **local** space (`legA.position.set(0.2, 0, 0.2)`). Reuse one `BoxGeometry` across many `Mesh`es — geometry is the memory-heavy part; materials can be shared too.
48. **Write builders for repeated assemblies** — `makeChair({ width, height })` returning a `Group` beats copy-pasted meshes, and it is the seam where you later swap in `InstancedMesh` (§57). For scatter/detail use a seeded PRNG, not `Math.random()`, so the scene looks identical across reloads (otherwise it "changes every refresh").
49. **Materials: pick the right class** — `MeshBasicMaterial` (unlit, ignores lights and shadows — debug/UI only), `MeshLambertMaterial` (cheap diffuse), `MeshStandardMaterial` (PBR `roughness` + `metalness`, the default choice), `MeshPhysicalMaterial` (adds `clearcoat`, `transmission`, `thickness`, `ior`, `sheen`, `iridescence`, `anisotropy`). PBR values are physical: `metalness` is 0 or ~1 (0.5 looks like nothing on earth), `roughness` runs 0.05 (polished) → 0.9 (matte).
50. **`MeshPhysicalMaterial` for the refined look** — `{ clearcoat: 1, clearcoatRoughness: 0.1 }` = lacquered/car paint; `{ transmission: 1, thickness: 0.5, ior: 1.5, roughness: 0.05, metalness: 0 }` = glass/water (needs `scene.environment` to reflect/refract anything, and is the most expensive path: transmission meshes render in a **separate pass** and do not refract other transmission meshes); `{ sheen: 1, sheenColor }` = cloth; `{ iridescence: 1 }` = soap bubble. For cheap alpha (windows, foliage) use `transparent: true, opacity: 0.4, depthWrite: false` instead.
51. **Maps beat uniform values** — a constant `roughness` looks like plastic; real surfaces vary. Supply `roughnessMap` / `metalnessMap` (read from the green/blue channels) for variation, `normalMap` for detail without geometry, and `aoMap` for crevice darkening. `bumpMap` and `displacementMap` exist but are weaker/expensive. **`aoMap` samples a second UV set**: add `geometry.setAttribute('uv1', uvAttr)` (named `uv2` before r151) and set `texture.channel = 1`, or the AO reads the wrong coordinates (usually renders black).
52. **Color space is the #1 "washed out / too dark" bug** — set `map.colorSpace = THREE.SRGBColorSpace` on **colour/albedo maps only**. Normal, roughness, metalness, AO and displacement maps are *data* and must stay linear (the default `THREE.NoColorSpace`); marking them sRGB double-corrects and destroys the surface. `renderer.outputColorSpace = THREE.SRGBColorSpace` is the default in r152+ — don't override it, and prefer `renderer.toneMapping = THREE.ACESFilmicToneMapping` with `toneMappingExposure` ≈ 1 for a photographic look.
53. **Textures, tiling and sharpness** —
    ```js
    const tex = new THREE.TextureLoader().load('/tex/wood.jpg');   // or await loadAsync(url)
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(4, 4);                                          // tile per real-world metre
    tex.anisotropy = renderer.capabilities.getMaxAnisotropy();     // kills floor shimmer at grazing angles
    ```
    The default `ClampToEdgeWrapping` plus `repeat.set(4,4)` gives a stretched smear, not a tiled floor. Large textures should be KTX2/Basis-compressed or they blow the GPU memory budget; `generateMipmaps: false` is for UI overlays only.
54. **Texture loading is async** — code that reads `tex.image` right after `load()` sees nothing; do the work in the callback or `await new THREE.TextureLoader().loadAsync('/wood.jpg')`. An all-white material is usually a texture that has not loaded yet, or a 404 (check the network log). Sharing one `Texture` across many materials costs one GPU upload.
55. **Image-based lighting (IBL) is what makes PBR look real** — a scene lit only by a `DirectionalLight` renders like the 1990s. Load an HDRI/EXR and use it as the environment (reflections **and** ambient):
    ```js
    import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
    const hdr = await new RGBELoader().loadAsync('/env/studio.hdr');
    hdr.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = hdr;      // lights every PBR material in the scene
    scene.background = hdr;       // or a solid THREE.Color / gradient
    ```
    `EXRLoader` (`three/examples/jsm/loaders/EXRLoader.js`) is the `.exr` equivalent; both need half-float support (universal on WebGL2). `.hdr`/`.exr` must be served with sane MIME types or the fetch fails silently (see `static-frontend`).
56. **Pre-filter the environment with `PMREMGenerator`** — a raw equirect texture puts a sharp reflection on every roughness level (fake-looking metal):
    ```js
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envRT = pmrem.fromEquirectangular(hdr);
    scene.environment = envRT.texture;
    hdr.dispose(); pmrem.dispose();     // free the source, keep the generated render target
    ```
    No HDR file at all? Generate a studio: `scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture` (`three/examples/jsm/environments/RoomEnvironment.js`) — the fastest route to believable lighting with zero assets. Tune per material with `material.envMapIntensity` (0.5–2) and, in r163+, `scene.environmentIntensity`.
57. **`InstancedMesh` for repeated real objects** — one draw call for thousands of trees/chairs:
    ```js
    const inst = new THREE.InstancedMesh(geo, mat, count);
    const m = new THREE.Matrix4(), q = new THREE.Quaternion();
    for (let i = 0; i < count; i++) {
      m.compose(new THREE.Vector3(x, y, z), q, new THREE.Vector3(1, 1, 1));
      inst.setMatrixAt(i, m);
      inst.setColorAt(i, new THREE.Color(0x884422));   // per-instance tint
    }
    inst.instanceMatrix.needsUpdate = true;
    inst.instanceColor.needsUpdate = true;             // only if setColorAt was used
    inst.computeBoundingSphere();                      // see gotcha below
    ```
    Gotchas: instanced bounds are computed from the instance matrices and then **cached**, so once you move instances with `setMatrixAt()` you must call `computeBoundingSphere()` again (or set `frustumCulled = false`) — otherwise culling uses stale bounds and instances vanish when you pan away; raycasting returns `instanceId`; matrices must be written before the first render; geometry/material cannot differ per instance (use `setColorAt` or an `InstancedBufferAttribute`); and instances never show up as individual meshes in `scene.traverse`.
58. **Curves for real paths** — `new THREE.CatmullRomCurve3([v0, v1, v2], closed, 'centripetal')` (also `LineCurve3`, `QuadraticBezierCurve3`, `CubicBezierCurve3`, `EllipseCurve`). `curve.getPoint(t)` spaces samples evenly in parameter space while `curve.getPointAt(t)` spaces them by **arc length** — use `getPointAt` for anything that moves along a road/cable, or its speed visibly varies. Also `curve.getLength()`, `curve.getSpacedPoints(n)`, `curve.getTangentAt(t)`, and `curve.computeFrenetFrames(n)` to orient a vehicle along the path; feed the curve to `TubeGeometry` for pipes.
59. **Shadows read as "grounded"** — `renderer.shadowMap.enabled = true`, `renderer.shadowMap.type = THREE.PCFSoftShadowMap`, `light.castShadow = true`, and `castShadow`/`receiveShadow` on the meshes + floor (all required, §14). A `DirectionalLight` shadow camera is **not** auto-fit: set `light.shadow.camera.left/right/top/bottom` to your world bounds, `.near/.far`, and `light.shadow.mapSize.set(2048, 2048)`, or the shadows are blocky/clipped. Cheap realism for scattered props: a radial-gradient texture on a small `PlaneGeometry` as a contact shadow.
60. **Loading real assets** — GLB is preferred (`gltf.scene` + `gltf.animations`): `const gltf = await new GLTFLoader().loadAsync('/models/chair.glb'); scene.add(gltf.scene);`. Exact addon paths for other formats: `three/examples/jsm/loaders/OBJLoader.js` (+ `MTLLoader.js`), `FBXLoader.js`, `STLLoader.js`, `PLYLoader.js`, `SVGLoader.js` (parses to `paths` → `SVGLoader.createShapes(path)` → `ExtrudeGeometry`), `GLTFLoader.js`, `RGBELoader.js`, `EXRLoader.js`, `KTX2Loader.js`, `DRACOLoader.js`. All take `(url, onLoad, onProgress, onError)` — always handle the error, because a bad path otherwise yields a silently empty scene (§10).
61. **Post-load normalisation agents always need** —
    ```js
    gltf.scene.traverse(o => {
      if (!o.isMesh) return;
      o.castShadow = o.receiveShadow = true;
      if (o.material) o.material.envMapIntensity = 1;
    });
    const box = new THREE.Box3().setFromObject(gltf.scene);
    const size = box.getSize(new THREE.Vector3());
    gltf.scene.scale.setScalar(2.0 / size.y);                 // normalise to a real 2 m height
    const box2 = new THREE.Box3().setFromObject(gltf.scene);  // recompute AFTER scaling
    gltf.scene.position.y -= box2.min.y;                      // drop the feet onto y = 0
    ```
    Assets arrive at arbitrary scale, origin and orientation — auto-fit with `Box3` instead of guessing `scale.setScalar(0.01)`. `Box3.setFromObject` ignores skinned/morphed deformation (it uses the bind pose), so fit skinned characters by their rig height.
62. **Draco/KTX2/Meshopt compressed assets** — a compressed GLB fails with `THREE.DRACOLoader: No DRACOLoader instance provided`:
    ```js
    import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
    import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js';
    const draco = new DRACOLoader().setDecoderPath('/draco/');   // copy from node_modules/three/examples/jsm/libs/draco/
    const ktx2 = new KTX2Loader().setTranscoderPath('/basis/').detectSupport(renderer);
    const loader = new GLTFLoader().setDRACOLoader(draco).setKTX2Loader(ktx2);
    ```
    The decoder `.js` + `.wasm` must be **served from your origin** (a CDN works but breaks offline/CSP); `KTX2Loader` also needs `detectSupport(renderer)`. Meshopt: `loader.setMeshoptDecoder(MeshoptDecoder)` from `three/examples/jsm/libs/meshopt_decoder.module.js`.
63. **FBX/OBJ gotchas** — FBX is usually exported in **centimetres**: `model.scale.setScalar(0.01)`, then re-fit with §61. `FBXLoader` sets color space correctly and adds clips to `model.animations`; `OBJLoader` + `MTLLoader` do **not** fix color space or units, and MTL texture paths resolve relative to the loader's `setPath()` (a `.mtl` that 404s leaves plain white materials). Enable `THREE.Cache.enabled = true` to avoid double-fetching shared textures, and use a `LoadingManager` with `onProgress`/`onError` so missing files surface instead of a blank canvas.
64. **Merge static geometry to cut draw calls** — `import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'` (named `mergeBufferGeometries` before r151); `mergeGeometries([g1, g2, g3])` returns `null` when the inputs disagree — all indexed or all non-indexed (`toNonIndexed()`), identical attribute sets (delete the extras), same material. Merge only **static** geometry: it bakes transforms and cannot be moved or lit per-part afterwards.
65. **Generate detail, don't model it** — realism in code comes from bevels (a perfectly sharp 90° edge catches no highlight — add a 1–2 mm `bevelSize` via `ExtrudeGeometry`, or a rounded box for legs), normal maps, roughness variation, tiny `position`/`rotation` jitter on scattered props, and `roughness >= 0.3` (nothing real is a perfect mirror). `flatShading: true` reads as low-poly, not realistic.
66. **Performance budget** — aim for a few hundred draw calls (merge/instance to get there) and trust `renderer.info.render.calls` / `.triangles` / `.geometries` / `.textures` over intuition. Use `THREE.LOD()` for hero objects (`lod.addLevel(mesh, distance)` + `lod.update(camera)` each frame) and cap `renderer.setPixelRatio(Math.min(devicePixelRatio, 2))` (§5).
67. **Verify the object actually exists in the render** — in the browser tool count meshes via `js` (`let n = 0; scene.traverse(o => o.isMesh && n++)`), assert `renderer.info.render.triangles > 0`, check the network log for 404s on `.glb`/`.hdr`/`/draco/`, and screenshot — a uniform black frame means *no light/environment* (§55), not a missing model. Sanity-check real-world bounds with `new THREE.Box3().setFromObject(scene).getSize(new THREE.Vector3())`: a 0.02 m-tall chair or a 500 m room is a unit bug (see `ui-verification`, `make-it-run`).
68. A scene that "compiles" is not done — the canvas must draw non-blank frames, animations must advance (`mixer.time` grows), objects must sit at believable real-world scale, and the console must be clean.

## Related skills
- `html5-apis` — the platform layer: WebGL context, `requestAnimationFrame` timing, `visibilitychange`, DPR.
- `motion-design` — easing/duration/stagger and reduced-motion policy for the tweened UI around the scene.
- `css-animation` — the DOM-side equivalent of `transform`/`opacity` motion and `prefers-reduced-motion`.
- `sprite-animation` — texture-atlas frame stepping for 2D HUD/particle flipbooks.
- `static-frontend` — serving meshes/HDRI/decoder files with the right paths and MIME types.
- `react-frontend` — mounting/unmounting a `WebGLRenderer` inside a component without leaking contexts.
- `ui-verification` / `make-it-run` — drive the real page and prove the scene renders and animates.
