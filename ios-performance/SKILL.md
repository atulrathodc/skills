---
name: ios-performance
description: Profile and fix iOS app performance with Instruments — main-thread hangs and scroll hitches, SwiftUI body recomputation, image decoding, layout thrash, cell reuse, retain cycles and leaks, launch time, energy, and app size. Measure on a real device in a Release build, never the simulator.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# iOS Performance

Performance work is measurement, not intuition. The three rules that invalidate most performance
"findings" before they start: **profile a Release build**, **profile on a real device**, and
**profile the actual flow** rather than app launch.

1. **Never measure a Debug build** — Debug compiles at `-Onone` with no optimization and retains extra runtime checks, so it can be several times slower than what ships. Profile the Release configuration (`-configuration Release`, `-O`, whole-module optimization), or every number is fiction.
2. **Never trust the simulator for performance** — it runs on the Mac's CPU and GPU, with Mac memory bandwidth and no thermal or battery constraints. Scroll jank, battery, and memory pressure simply do not reproduce there. Use the simulator for layout, the device for numbers.
3. **Pick the Instrument template by the question** — **Time Profiler** (where is CPU going, by stack), **Allocations**/**Leaks** and the memory graph debugger (what is retained and by whom), **Animation Hitches** (frame drops and their cause), **Energy Log** (battery), **Network** (request cost), **Metal System Trace** (GPU), **App Launch** (startup phases). Choosing the template is choosing the hypothesis.
4. **A main-thread hang is the cause of nearly all jank** — in Time Profiler, enable **Separate by Thread** and read the main thread's heaviest stack. Scrolling hitches, a frozen UI, and a watchdog kill are the same root cause at different severities: synchronous work on the main thread (parsing, disk I/O, image decode, a big sort).
5. **Scroll jank is per-frame work, not per-scroll work** — a hitch is caused by a frame exceeding ~16 ms (8 ms on 120 Hz ProMotion). Find the code running *on every frame or every cell appearance*, not the code that runs once.
6. **Image decoding is the classic hidden main-thread cost** — decoding a large JPEG/HEIC happens lazily on first draw, on the main thread, at full resolution even for a thumbnail. Downsample to the display size off-main (ImageIO `CGImageSourceCreateThumbnailAtIndex` with `kCGImageSourceThumbnailMaxPixelSize`) and cache the result. This one fix resolves a large share of "the list scrolls badly".
7. **`UITableView`/`UICollectionView` cells must be fully reset on reuse** — a reused cell keeps the previous row's image, text, and async results. Cancel outstanding image loads in `prepareForReuse`, and guard against a late-arriving response writing into a cell that now shows different data.
8. **Keep `cellForRowAt` cheap** — no synchronous network, no disk reads, no layout that forces a full sizing pass. Compute the model beforehand, not inside the data source callback.
9. **Auto Layout thrash shows as a layout loop** — a `layoutSubviews` that invalidates layout again, ambiguous constraints resolved differently each pass, or `systemLayoutSizeFitting` called per row for dynamic heights. Instruments shows it as repeated `layoutSubviews`/`layoutIfNeeded` frames rather than one expensive call.
10. **SwiftUI: `body` recomputation is the top cost** — use the SwiftUI view-body instrument (Xcode 14+) to find views re-evaluating far more than expected, and `Self._printChanges()` to see which dependency triggered it. Fixes are splitting large bodies into small subviews, narrowing what state a view observes, and not doing work inside `body` (see `swiftui`).
11. **A view that recomputes constantly usually observes too much** — with `ObservableObject`, any `@Published` change invalidates every observer even if that property is irrelevant; with `@Observable`, SwiftUI tracks per-property access, so reading less in `body` genuinely reduces work. Pass narrow values (a `String`, a formatted date) down rather than a whole model when the child needs one field.
12. **Retain cycles are the number-one leak** — a delegate must be `weak`, and a closure stored on `self` that captures `self` strongly (a completion handler, a timer target, an observer) never releases. `[weak self]` with a `guard let self else { return }` is the fix; the Leaks instrument and the Xcode memory graph debugger (`Debug Memory Graph`) show the exact cycle and the retaining path.
13. **`deinit` not being called is your signal** — add a `deinit` that logs to any object you expect to be released. If the log never appears after the flow ends, you have a cycle; find it with the memory graph rather than by reading code.
14. **Watch for unbounded growth, not just a steady number** — take memory snapshots at the start and end of a repeated flow (open/close a detail screen 20 times). A graph that climbs and never returns to baseline is a leak or an ever-growing cache; a flat graph under pressure is fine.
15. **Launch time is a budget with a hard limit** — iOS kills an app that takes too long to launch, and the watchdog does not care that your code was going to finish. Measure with the App Launch instrument or `DYLD_PRINT_STATISTICS=1`, and cut expensive work from `didFinishLaunching`/`App.init`: defer analytics, preload, and migrations until after the first frame.
16. **Fewer dynamic frameworks, faster launch** — each embedded dynamic framework adds dyld work at startup. Prefer static linking or Swift Package Manager over a pile of `.framework` bundles, and avoid running migrations or network calls synchronously at launch.
17. **Energy is dominated by wakeups, not CPU percentage** — polling timers, frequent small network requests, and continuous location drain battery. Coalesce requests, replace a polling timer with a push or `BGTaskScheduler`, and use the Energy Log's wakeup counts to find them.
18. **App size is a user-facing performance metric** — enable app thinning, check the size breakdown in the Organizer, and move large optional assets to On-Demand Resources. A large `.ipa` costs installs, and cellular download limits block updates.
19. **Turn a fixed regression into a test** — `XCTOSSignpostMetric`, `XCTMemoryMetric`, and `XCTClockMetric` in an `XCTestCase.measure` block assert on signposts and resource use, so a performance fix cannot silently regress in CI. Instrument your own code with `os_signpost` so the metric has something to measure (see `ios-testing`).
20. **Report numbers, not impressions** — "scrolling feels smoother" is not a result. State the device and OS, the configuration, the flow measured, and the before/after figures (p50/p99 frame time, peak memory, launch time, wakeups). Without the before number you cannot claim an improvement.

## Related skills

- `swiftui` — body recomputation and state-scoping rules this skill measures.
- `ios-testing` — `XCTMetric`-based performance regression tests.
- `mobile-app-debugging` — hangs, watchdogs, and OOM kills that performance work prevents.
- `game-performance` / `performance-analysis` — the general measurement discipline.
- `observability` — signposts and logging that make a field problem measurable.
- `react-native-performance` — the same problems in a cross-platform app.
