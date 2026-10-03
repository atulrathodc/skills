---
name: react-native-performance
description: Diagnose and fix React Native performance — slow startup, janky scrolling, wasteful re-renders, list windowing, image cost, and measuring before claiming a win.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# React Native Performance

Mobile performance is a budget on a low-power device, not a benchmark on your laptop. Measure on a real device, then fix the biggest cost.

1. **Measure first, on the target** — React DevTools Profiler for render cost; Android `adb shell dumpsys gfxinfo <pkg> framestats` for janky frames; Xcode Instruments (Time Profiler) on iOS; the Hermes sampling profiler via the RN CLI's `profile-hermes`. A "faster" claim with no before/after numbers is not a fix.
2. **Long lists are the usual culprit** — `FlatList` (or `FlashList`) with windowing, never `ScrollView` + `.map()`. Give it a stable `keyExtractor` (server ids, NOT the array index — index keys make rows reuse the wrong state), `getItemLayout` when rows are fixed height, and memoized row components.
3. **Inline objects and arrows in props defeat memoization** — `style={{...}}`, `onPress={() => …}`, and freshly built arrays create a new prop identity every render, so `React.memo` on the child never helps. Hoist constants, `useCallback` the handlers (profile before sprinkling — the hooks have their own cost).
4. **Re-renders usually start at the provider** — one top-level context with fast-changing values re-renders the whole tree. Split contexts, and move state down to the component that owns it.
5. **Images are decoded work, not free** — oversized PNG/JPGs cost memory and JS-thread time. Downscale to the display size, request sized variants from the backend, use `expo-image` for caching/placeholders, and avoid decoding large images during startup.
6. **Startup is imports + first render** — a heavy `import` graph, doing work at module scope, or a JSON cold-start from storage all delay first paint. Defer non-critical work past first render, lazy-require rarely used screens, and keep Metro's `inlineRequires` on in production.
7. **Debug builds lie** — a debug build runs unminified with dev-mode checks and a live Metro connection; release adds minification, Hermes bytecode, and stripped logging. Profile a RELEASE build before believing a number, and be suspicious of any bug that only reproduces in debug.
8. **Verify the win, and the absence of regressions** — re-run the same measurement on the same device and build type, and confirm the interaction still behaves correctly (a memoization bug that skips a needed re-render looks like a perf win and ships as a stale UI). Fold the check into `react-native-verification`.

## Related skills

- `react-native-verification` — proving the optimized app still does the right thing.
- `react-native-ui-styling` — layout choices (nested scroll views, uncached images) that cost frames.
- `performance-analysis` — the general measurement discipline this skill applies to mobile.
- `mobile-app-debugging` — distinguishing a hang/ANR from genuine slowness.
