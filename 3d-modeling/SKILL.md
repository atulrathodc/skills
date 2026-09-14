---
name: 3d-modeling
description: Author and repair 3D objects and their geometry — primitives and hand-built BufferGeometry in code, lathe/extrude/tube/text shapes, CSG booleans, importing and fixing glTF/OBJ/STL/FBX models, real-world units and scale, and optimizing/exporting meshes for the web.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# 3D Modeling

How an agent actually **creates and fixes the objects** — the meshes and their geometry — as opposed to standing up a scene, camera, lights and render loop (that is `threejs-3d`). Sections: authoring vs importing, primitives, parametric geometry, hand-built `BufferGeometry`, CSG booleans, normals, units, compression, import repair, export, verification. Sizes below are real-world **metres** unless stated (see §29).

## Authoring vs importing — pick a lane

1. **Two ways to get an object** — (a) **procedural**: build geometry in code from primitives or a hand-written `BufferGeometry`; (b) **authored**: model it in a DCC (Blender, Maya, C4D) and import it. Code wins for parametric, kit-bashed, repetitive and data-driven geometry (a shelf of N books, a table sized to a spec); a DCC wins for sculpted/organic/high-detail hero meshes. Mixing both in one scene is normal — build the enclosure in code, import the sculpted part.
2. **glTF/`.glb` is the web-first format** — it is the only interchange format with a complete mesh + PBR-material + texture + animation spec, and it is what `GLTFLoader` targets. Ship **`.glb`** (binary, one file: geometry + textures + animations) rather than `.gltf` + external `.bin`/image files, which multiply the ways a path can 404.
3. **OBJ is geometry-only by default** — `OBJLoader` returns a `Group` whose meshes carry a single default grey material. Materials live in the sibling `.mtl` (`MTLLoader`), and OBJ has **no PBR, no animation, no units, no color-space metadata, and no embedded textures** — texture paths in the `.mtl` resolve relative to the loader's `setPath()`. Fine for static props; not for a hero asset.
4. **STL and FBX are the "it looks wrong" formats** — STL is triangles only: no materials, no UVs, no units, usually **mm** from a printer pipeline. FBX is often **centimetres** and Y-up-inconsistent: expect `model.scale.setScalar(0.01)` and inspect immediately after load. `FBXLoader` does set color space and puts clips on `model.animations`; `OBJLoader`/`STLLoader` do not.
5. **Decide the polygon budget before you import** — a 500k-triangle sculpt will never hold 60 fps in a browser no matter what you do afterwards. Pick a target early (tens of thousands of triangles for a hero prop, hundreds of thousands only for a single full-screen subject) and decimate/compose to it (§32).

## Primitives and composition

6. **Know your primitive set** — `BoxGeometry(w, h, d)`, `SphereGeometry(radius, widthSeg, heightSeg)`, `CylinderGeometry(rTop, rBottom, height, radialSeg)`, `ConeGeometry`, `TorusGeometry`, `TorusKnotGeometry`, `PlaneGeometry`, `CircleGeometry`, `RingGeometry`, `CapsuleGeometry(radius, length, capSeg, radialSeg)`, `IcosahedronGeometry`/`OctahedronGeometry`/`TetrahedronGeometry`. Every argument is a **real-world size in scene units**, not a 0..1 factor.
7. **Segment counts are the cost** — the `*Segments` arguments multiply triangles. `SphereGeometry(1, 8, 6)` is 96 triangles and visibly faceted; `SphereGeometry(1, 64, 32)` is ~4k and smooth. Pick the lowest count that still reads smooth at the object's on-screen size — a 10 cm bolt does not need 64 segments.
8. **Compose, don't sculpt** — a chair is 4 box legs + a seat box + a back box under one `Group`. Move/rotate/scale the **parent `Group`**, never the children: a mesh rotates around its own origin, so an off-centre child spins oddly — offset the child inside a parent `Group` and rotate the group instead.
9. **Write builder functions that return a `Group`** — this is how an agent deterministically generates "12 lamps in a room" instead of re-modeling each one:
    ```js
    function makeLamp({ height = 0.35, shade = 0xf0e6d2 } = {}) {
      const g = new THREE.Group();
      g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, height, 8), baseMat));
      const s = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.11, 24, 1, true), shadeMat);
      s.position.y = height / 2;
      g.add(s);
      g.name = 'lamp';
      return g;                                  // caller positions the whole lamp
    }
    ```
10. **Share geometry, vary instances** — `new THREE.Mesh(sharedGeo, sharedMat)` for 20 identical screws costs 20 draw calls but **one** GPU upload; clone a geometry only when you actually mutate its attributes. For hundreds of copies use `THREE.InstancedMesh` instead of hundreds of `Mesh`es (see `threejs-3d` §64/§66).

## Parametric geometry — profiles, extrusions, sweeps, text

11. **`LatheGeometry` turns a 2D profile into a solid of revolution** — a `Vector2[]` where **x = radius** and **y = height** (keep x ≥ 0 or the profile self-intersects), spun around the Y axis. Vases, bottles, bowls, table legs, chess pieces:
    ```js
    const profile = [];                            // 0.3 m tall, ≤ 0.13 m radius
    for (let i = 0; i <= 12; i++) {
      const t = i / 12;
      profile.push(new THREE.Vector2(Math.sin(t * Math.PI) * 0.12 + 0.01, t * 0.3));
    }
    new THREE.LatheGeometry(profile, 48);          // 2nd arg = radial segments
    ```
    The profile's first/last x should be ~`0` if you want the top/bottom closed; a lathed object has no caps by default.
12. **`ExtrudeGeometry` gives a flat `Shape` volume** — `new THREE.ExtrudeGeometry(shape, { depth: 0.02, bevelEnabled: true, bevelSize: 0.001, bevelThickness: 0.001, bevelSegments: 2, curveSegments: 12 })`. It extrudes along **+Z**, so rotate `-Math.PI/2` about X to stand it on the ground. This is signs, panels, mounting plates, extruded logos — and the `bevel*` options are what make the edges catch light (§28).
13. **Holes come from `shape.holes`** — a `Shape` is a silhouette; a screw hole, window or keyway is a `Path` pushed into `.holes`:
    ```js
    const s = new THREE.Shape(); s.moveTo(-0.5, -0.3); s.lineTo(0.5, -0.3); s.lineTo(0.5, 0.3); s.lineTo(-0.5, 0.3); s.closePath();
    const hole = new THREE.Path(); hole.absarc(0, 0, 0.1, 0, Math.PI * 2, true);
    s.holes.push(hole);                            // holes must wind opposite the outer shape
    ```
14. **Build outlines with `Shape`/`Path` verbs, not a raw vertex list** — `moveTo`, `lineTo`, `quadraticCurveTo`, `bezierCurveTo`, `absarc`, `splineThru`, `closePath`. After `moveTo`, `lineTo` is **relative to the current point's coordinate space you set** — mixing absolute and relative expectations is the classic "my outline is a mess" bug. Use `splineThru([...points])` to smooth a hand-authored polygon.
15. **`TubeGeometry` sweeps a circle along a `Curve3`** — pipes, cables, rails, wires:
    ```js
    const path = new THREE.CatmullRomCurve3(points, false, 'centripetal');   // 'centripetal' avoids kinks/loops
    new THREE.TubeGeometry(path, 64 /* tubularSegments */, 0.02 /* radius */, 8 /* radialSegments */, false /* closed */);
    ```
    Also available: `QuadraticBezierCurve3`, `CubicBezierCurve3`, `LineCurve3`, `CatmullRomCurve3` — all usable as the `extrudePath` of `ExtrudeGeometry` to sweep a custom profile instead of a circle.
16. **`ShapeGeometry` fills a flat shape; `TextGeometry` needs a loaded font** — `new THREE.ShapeGeometry(shape, curveSegments)` is a triangulated 2D fill (no depth): decals, floor plans, overlays. Real 3D text loads a `.typeface.json` **async**:
    ```js
    import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
    import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
    new FontLoader().load('/fonts/helvetiker_regular.typeface.json', font => {
      const geo = new TextGeometry('HELLO', { font, size: 0.5, height: 0.1, curveSegments: 6, bevelEnabled: true, bevelSize: 0.005, bevelThickness: 0.005 });
      geo.center();                                // otherwise it grows out from the origin
      scene.add(new THREE.Mesh(geo, mat));
    });
    ```
    Build the mesh **inside the callback** (same async trap as `threejs-3d` §10). `height`, `curveSegments` and `bevelSegments` blow up triangle count fast — for a quick label use a `CanvasTexture` on a `PlaneGeometry` instead.

## Hand-built `BufferGeometry` — the escape hatch

17. **The four attributes are position / normal / uv / index** —
    ```js
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
    geo.setAttribute('normal',   new THREE.Float32BufferAttribute(normals, 3));
    geo.setAttribute('uv',       new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(indices);                          // 3 ints per triangle
    ```
    **`position` is mandatory** — a geometry without it renders nothing and logs no error. Attribute `itemSize` is inferred from the name (3 for position/normal, 2 for uv).
18. **Winding order decides which side faces out** — front faces are **counter-clockwise seen from outside** (right-hand rule). Wrong winding + the default `FrontSide` material = an invisible mesh. Confirm it is winding and not a missing mesh by temporarily setting `material.side = THREE.DoubleSide`, then fix the vertex order rather than shipping `DoubleSide` (it disables culling and hides lighting bugs).
19. **Indexed vs non-indexed** — `setIndex(...)` shares vertices: fewer vertices, smaller file, smoother normals. `geometry.toNonIndexed()` expands to 3 unique vertices per triangle (~3× the vertex count) — required when you want per-face colours/flat shading or as input to some tools.
20. **Recompute normals and bounds after ANY vertex surgery** — after editing `position.array`, CSG, `mergeGeometries`, `toNonIndexed()`/`toIndexed()`, or scaling by writing positions, call **`geometry.computeVertexNormals()`** and `geometry.computeBoundingSphere()`; in-place edits also need `attribute.needsUpdate = true`. Stale normals render black or flatly lit and stale bounds break raycasting/frustum culling.
21. **UVs are required for any texture, and dispose what you rebuild** — untextured geometry needs no `uv`, but a `map` on geometry with no `uv` attribute renders a solid colour or warns `No UV`. Primitives ship UVs; your own geometry must supply them (normalized `position.x`/`position.z` is a common planar projection). And `geometry.dispose()` whenever you replace or regenerate a geometry — rebuilding one every frame is the classic "GPU memory grows until the tab dies" leak (see `threejs-3d` §15).

## CSG / booleans — subtractive hard-surface modeling

22. **Use a CSG library for "drill a hole / cut a slot / union two solids"** — two current options:
    - **`three-bvh-csg`** (BVH-accelerated, fast; also installs `three-mesh-bvh`):
      ```js
      import { Evaluator, Brush, ADDITION, SUBTRACTION, INTERSECTION } from 'three-bvh-csg';
      const a = new Brush(geoA, mat), b = new Brush(geoB, mat);
      a.updateMatrixWorld(true); b.updateMatrixWorld(true);
      const result = new Evaluator().evaluate(a, b, SUBTRACTION);   // → Brush; keep result.geometry
      ```
    - **`three-csg-ts`** (simpler API, slower): `import { CSG } from 'three-csg-ts'; const out = CSG.subtract(meshA, meshB);` (also `CSG.union`, `CSG.intersect`).
23. **Both operands must share the same world space** — call `mesh.updateMatrixWorld(true)` (or bake the transform into the geometry) before evaluating, or the cut lands in the wrong place. Feed the **result's geometry** to the mesh you actually keep; the intermediate `Brush`es are throwaway.
24. **Booleans are a build-time tool, not a runtime one** — each evaluation allocates fresh geometry and can take tens of ms on dense meshes, so do it **once** at author/build time and cache the result. Re-evaluating CSG every frame tanks the frame rate and leaks memory; dispose the input geometries after the op.
25. **Expect triangulated, non-manifold output** — CSG output is triangle soup with no useful UVs from the source shapes: re-`computeVertexNormals()` (§20) and re-bake UVs if textured. **Coplanar** faces (two surfaces exactly touching) produce z-fighting — nudge by ~1e-4 m, or overlap the operands slightly.

## Normals and shading

26. **Smooth vs flat is a normals question** — per-vertex normals average across adjacent faces → **smooth** shading; per-face normals → faceted. `geometry.computeVertexNormals()` produces the smooth kind, while `material.flatShading = true` is a shader-side override that ignores the geometry normals entirely. Low-poly looks (`flatShading`) read as stylised, never as realistic.
27. **"Everything is black" is almost never a normals bug** — black means the surface faces away from every light (inverted normals do this: outside dark, inside lit) **or** there is simply no light/environment in the scene (a `MeshStandardMaterial` with no lights renders pure black — the #1 cause, see `threejs-3d` §6/§7). Test with `material.wireframe = true` and `material.side = THREE.DoubleSide` to tell the two apart.
28. **"Everything is flat/dull/plastic" is a normals/bevel problem** — a perfectly sharp 90° edge catches no highlight no matter how correct the normals are. Realism comes from a **bevel/chamfer** (`ExtrudeGeometry` `bevelSize` of 1–2 mm, or a rounded box), a normal map, roughness variation, and tiny `position`/`rotation` jitter on scattered props (see `threejs-3d` §65).

## Units and scale — the #1 "it's tiny / enormous" bug

29. **glTF is metric: 1 unit = 1 metre, by spec** — a 1.8-unit-tall exported person should measure 1.8 m. Author to metres in code (`BoxGeometry(0.4, 0.4, 0.4)` is a 40 cm crate) and **measure what you import** with a `Box3` (§44) instead of trusting the exporter.
30. **Centimetre exports are 100× too big** — Blender/3ds Max/FBX commonly export centimetres: `model.scale.setScalar(0.01)` (0.01, **not** 0.1). The object did not "explode" — it was always that size, just huge relative to the camera `far` plane (`threejs-3d` §12). Millimetre exports need `0.001`.
31. **Up axis differs between tools, and one scale must win** — Blender/Max are **Z-up**, glTF and three.js are **Y-up**; the glTF exporter converts (`+Y up`) so a Y-up-authored Blender scene arrives **rotated**, and a model that lies on its face is an up-axis mismatch (`model.rotation.x = -Math.PI / 2`, or fix `export_yup` at export). Normalise **every** import to metres at the load boundary — mixing a metre-authored code primitive with a centimetre FBX gives a doll's chair next to a building.

## Compressing and optimizing the exported model

32. **Decimate before you ship** — drop triangles the camera will never resolve: Blender's **Decimate** modifier (collapse ratio, e.g. 0.3), `gltf-transform simplify`, or `gltfpack -si 0.5`. A 2M-triangle photogrammetry scan becomes ~200k with no visible loss at world scale.
33. **Draco compresses geometry 5–10×** — `npx @gltf-transform/cli draco in.glb out.glb` (or Blender's "Draco mesh compression" export checkbox). The loader needs a **matching decoder**:
    ```js
    import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
    const draco = new DRACOLoader().setDecoderPath('/draco/');   // copy node_modules/three/examples/jsm/libs/draco/
    new GLTFLoader().setDRACOLoader(draco);
    ```
    Forget `setDRACOLoader` and you get `THREE.GLTFLoader: No DRACOLoader instance provided` and an empty scene.
34. **Meshopt is the lighter alternative** — `gltfpack -i in.glb -o out.glb -cc`, then `loader.setMeshoptDecoder(MeshoptDecoder)` using `three/examples/jsm/libs/meshopt_decoder.module.js`. It decodes fast and needs no separate `.wasm` path (though it is a WASM module too).
35. **Compress textures separately — they are usually the real bloat** — KTX2/Basis (`gltf-transform ktx` — or `etc1s`/`uastc` on older glTF-Transform versions — plus `gltfpack -tc`) stays GPU-compressed so it costs no decode RAM; WebP/AVIF (`gltf-transform webp`) for maximum compatibility. `KTX2Loader` needs `setTranscoderPath('/basis/')` **and** `detectSupport(renderer)` (see `threejs-3d` §62).
36. **Run the whole pipeline from the CLI, then measure** — `npx @gltf-transform/cli optimize in.glb out.glb` chains dedup → prune → resample → simplify → draco/meshopt → texture compression in one command; the individual subcommands (`dedup`, `prune`, `weld`, `resample`, `simplify`, `draco`, `meshopt`, `ktx`, `webp`) give control. `gltfpack` (meshoptimizer) is the meshopt-first alternative. **Always log bytes before/after and re-open the result** (§44): a "smaller" file that lost its UVs, skin or a texture is a regression, not an optimization.

## Importing and repairing a model

37. **`GLTFLoader` is async and its error callback is mandatory** — `loader.load(url, onLoad, onProgress, onError)`; without `onError` a bad path fails silently (empty scene, only a network 404). Do all post-load work — traverse, clone, instantiate, hide a loading spinner — **inside** `onLoad` (see `threejs-3d` §10–11).
38. **`.glb` must be served with the right MIME type** — `.glb` → `model/gltf-binary`, `.gltf` → `model/gltf+json`, `.bin` → `application/octet-stream`. A static server that returns `text/html` for `.glb` fails the parse; check the Network tab and serve through a real dev/static server (see `static-frontend`, `make-it-run`).
39. **Black or missing textures are three separate bugs** — (a) the texture path is wrong (relative paths resolve against the **model's** directory, not the page); (b) the **color space** is wrong — albedo/base-colour maps must be `texture.colorSpace = THREE.SRGBColorSpace` while normal/roughness/metalness/AO maps must stay linear (`THREE.NoColorSpace`), and `renderer.outputColorSpace` defaults to sRGB in r152+; (c) the material is `MeshBasicMaterial`, which ignores lights and looks flat. Loading glTF sets (b) for you — hand-loaded `TextureLoader` textures do **not**.
40. **Foreign/orphaned materials, and the repair checklist** — an imported model carries materials you did not author; fix them en masse (`model.traverse(o => { if (o.isMesh) { o.material.side = THREE.DoubleSide; o.castShadow = true; o.receiveShadow = true; } })`) and remember a **shared** material mutates for every mesh using it. Repair order for a "broken" import: 1) measure `Box3` size and fix units (§29–31); 2) `updateMatrixWorld(true)` if transforms look wrong; 3) `traverse` and count meshes/triangles; 4) scan the Network log for 404s on textures/`.bin`/decoder files; 5) read the console warnings — `PropertyBinding: No target node`, `No UV`, `No DRACOLoader instance` each names its own fix.

## Exporting from code

41. **`GLTFExporter` writes a `.glb` from a live scene graph** —
    ```js
    import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
    new GLTFExporter().parse(object, result => {                     // ArrayBuffer when binary:true, else JSON object
      const blob = new Blob([result], { type: 'model/gltf-binary' });// download link, or POST to a server
    }, err => console.error(err), { binary: true, onlyVisible: false, animations: clips });
    ```
    Set `binary: true` to embed textures in one file, and `trs: false` if you need correct **skeleton** export. It exports the current `BufferGeometry` **as-is** — it does not bake modifiers or procedural logic.
42. **`STLExporter` / `OBJExporter` for geometry-only interchange** — `new STLExporter().parse(mesh, { binary: true })` for printing/CAD, `new OBJExporter().parse(object)`. Both take the **object** (not a file handle) and carry **no materials or textures** — STL carries no UVs either.
43. **Blender headless is the agent's scripting seam** — `blender --background --python build.py` runs a `bpy` script with no GUI (`--factory-startup` for a clean state, `--python-expr "…"` for one-liners). In the script: build/transform meshes (`bpy.ops.mesh.primitive_*`, modifiers), then `bpy.ops.export_scene.gltf(filepath='out.glb', export_format='GLB')` — `export_apply=True` bakes modifiers, `export_yup` defaults to the Y-up glTF convention (§31). The process exits non-zero on failure and prints to stdout, so **check the exit code and parse the log**: this is how an agent generates a real authored asset without a human opening the app.

## Verifying a modeled object

44. **Prove the geometry exists and is the right size** — in the browser tool (`js` op): count meshes (`let n = 0; scene.traverse(o => o.isMesh && n++)`), read `renderer.info.render.triangles` / `.calls` / `.geometries` (all must be > 0), and measure real-world bounds with `new THREE.Box3().setFromObject(obj).getSize(new THREE.Vector3())` — a 0.02 m chair or a 500 m room is a unit bug (§29–31).
45. **Prove it renders, not merely loads** — screenshot and assert the frame is **not** a uniform black/blank image (black = no light/environment, §27); diff triangles before/after a rebuild to confirm your edit took; check the console for `No UV` / `PropertyBinding` / `No DRACOLoader` / failed-load warnings and the Network log for 404s on `.glb` / `.bin` / texture / decoder files. A model that draws one frame and then freezes is a render-loop bug (`threejs-3d` §4/§17).
46. **Prove the round trip** — re-open the exported or repaired `.glb` through a `GLTFLoader` load and compare triangle count and `Box3` size against what you authored; a "compressed" or "optimized" asset that changed either number is a regression (§36, §40). Keep draw calls in the low hundreds for a scene of props, and triangles in the tens of thousands.
47. **Modeling is done when** the object has the **right shape** (triangle count matches intent), the **right scale** (bounds match the real-world size in metres), the **right surface** (non-black texturing, correct color space, no inverted winding), and a **clean console** — `it compiles` and `it loads` are both insufficient (see `ui-verification`, `make-it-run`, `threejs-3d` §67–68).

## Related skills
- `threejs-3d` — the scene, camera, lights, materials and render loop this geometry plugs into; GLTFLoader/DRACOLoader wiring.
- `ui-verification` / `make-it-run` — drive the real page and assert the model renders at the right size with a clean console.
- `static-frontend` — serving `.glb`/`.bin`/decoder/KTX2 assets with correct paths and MIME types.
- `react-frontend` — lifecycle of loaded geometry (dispose on unmount) inside a component tree.
- `frontend-design` — the proportion, palette and detail level the object must fit.
- `motion-design` — how the modeled object should move once it exists.
