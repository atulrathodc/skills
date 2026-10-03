---
name: swiftui
description: Build SwiftUI views that update correctly — state ownership (@State/@Binding/@Observable), view identity and why state resets, ForEach identity, main-actor isolation and async, NavigationStack, sheets/alerts, layout traps, body recomputation, and where iOS and macOS diverge.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# SwiftUI

Most SwiftUI bugs are not layout bugs — they are **identity** and **state ownership** bugs wearing a
layout costume. "The text field loses what I typed", "the list scrolls to the wrong row", "the state
resets when I toggle something" all come from the same two rules.

## State ownership

1. **Pick the property wrapper by who owns the value, not by what compiles** — `@State` owns a value private to one view; `@Binding` passes a read-write reference *down* to a child; `@Observable` (iOS 17+) / `ObservableObject` models hold shared state. Getting this wrong is the root of most "my UI doesn't update" reports.
2. **`@StateObject` creates, `@ObservedObject` receives** — using `@ObservedObject` for a model the view itself instantiates recreates it on every re-render and silently discards its state. If the view creates it, it is `@StateObject`; if it is passed in, `@ObservedObject`. With `@Observable` this collapses to `@State` for owned and a plain `let` property for injected.
3. **A view is a struct — mutating a plain `var` in it does nothing** — `struct MyView: View { var count = 0 }` and `count += 1` in a button action mutates a temporary copy and is discarded. Anything that must persist is `@State`/`@Binding`/model-backed.
4. **`@State` initialises once, ever** — `@State private var text = ""` seeded from an `init` parameter keeps the FIRST value across re-renders, because SwiftUI preserves the storage and ignores later initialisers. To react to a changed input use `.onChange(of:)` or `.task(id:)`, not a new `init`.
5. **`@Observable` + `@Bindable` for two-way into a model** — with the macro you observe via any stored property, but to pass a `Binding` into a child you need `@Bindable var model = model` in the child's body. `ObservableObject` + `@Published` is the older equivalent; do not mix both patterns in one type.
6. **`body` must be pure and cheap** — SwiftUI may call it at any time and often. Reading a file, sorting a large array, or starting a request inside `body` causes repeated work and "Modifying state during view update" purple warnings. Compute in a model or `.task`, not in `body`.

## Identity — the rule people miss

7. **SwiftUI diffs by identity, so an `if` branch is a *different view*** — `if flag { A() } else { B() }` gives `A` and `B` separate identities, so any `@State` inside them is destroyed and recreated when `flag` flips. Keep state above the branch, or hoist the shared part out of it.
8. **A changed position in a container is a changed identity** — reordering or conditionally inserting views in a `VStack` can reset the state of the ones that moved. If a view unexpectedly loses state, look at what changed *around* it, not inside it.
9. **`.id(value)` forces a full recreate** — it is the right tool to deliberately reset everything under a view (e.g. re-key a form when the selected record changes) and a common accidental bug when applied broadly. It discards all state below it.
10. **`ForEach` needs stable, unique identity** — `ForEach(items, id: \.id)` (or `Identifiable`). Using `ForEach(items.indices, id: \.self)` or a duplicate id makes rows update the wrong content, animate strangely, and lose their state — the classic "I typed in row 3 and row 5 changed".
11. **`ForEach` over indices also crashes on mutation** — if the collection shrinks while SwiftUI holds an index-based identity, you get an index-out-of-range. Identity by a model value, never by position.

## Concurrency and async

12. **UI state must change on the main actor** — views and their state are `@MainActor` by default. A `Task { }` created from a view inherits that isolation; a `Task.detached`, a completion handler from an old API, or an `await` resumed on a background executor does not. Mutating state off-main causes runtime warnings and update glitches — annotate your model `@MainActor` so it cannot happen.
13. **`.task` is async and cancels; `.onAppear` is sync and does not** — use `.task` for anything awaited, since it is automatically cancelled when the view disappears (no more "set state on a view that's gone"). `.task(id:)` re-runs when the id changes, which is the idiomatic way to refetch on a selection change.
14. **Do not `await` inside `body`** — `body` is synchronous by design. Kick work off in `.task`/`.onAppear`/an action, and let state changes drive the render.
15. **Cancellation is cooperative** — a cancelled `.task` keeps running unless the work checks `Task.isCancelled` or calls a cancellation-aware API (`URLSession.data` is; a `for` loop over a big array is not). A fast-scrolling list that fires a request per row will pile up live requests without explicit cancellation checks.

## Navigation and presentation

16. **`NavigationStack` is value-based** — drive it with a `path: [Route]` binding and register destinations via `.navigationDestination(for: Route.self)`. Pushing a view with a closure-based `NavigationLink` still works but leaves you no programmatic control, which is why deep links and back-to-root are hard in that style.
17. **Never nest a `NavigationStack` inside another** — the inner one silently swallows the navigation and back button. If you need a second level, add destinations to the existing stack.
18. **Use `.sheet(item:)` over `.sheet(isPresented:)` for data** — the `isPresented` form captures whatever the state was at presentation time, so a changed selection shows stale content. `.sheet(item:)` re-presents with the right value and is the correct shape for "show details of X".
19. **A sheet's content has its own state lifetime** — it is destroyed on dismiss, so anything that must survive belongs in the parent or a model. On macOS, remember a sheet is attached to a window, not the app.

## Layout traps

20. **`GeometryReader` fills all available space and breaks sizing** — it expands to its parent's proposal and reports it to children, which is why a `GeometryReader` in a `VStack` pushes everything else out. Prefer `containerRelativeFrame`, a `Layout`, or `frame(maxWidth:)`; reach for `GeometryReader` only when you genuinely need the measured size, and keep it in a leaf.
21. **`Spacer()` and `frame(maxWidth: .infinity)` are different tools** — `Spacer` distributes leftover space between siblings; `maxWidth: .infinity` makes one view claim it. Using one where the other is meant gives layouts that look right until a sibling appears.
22. **`List` and `ScrollView` are not interchangeable** — `List` gives platform-correct styling, selection, swipe actions, and row reuse; `ScrollView` + `LazyVStack` gives control but no reuse of off-screen *content* semantics beyond laziness. Choose by whether you want platform behavior or custom behavior, and note `List` styling differs sharply between iOS and macOS.
23. **`Lazy*` containers still build the body of what is laid out** — laziness defers creation, not cost. An expensive `body` is still expensive when it finally runs; move the work out.

## Performance

24. **Split large bodies into small subviews** — SwiftUI re-runs the `body` of a view whose observed state changed, and a monolithic `body` re-evaluates everything inside it. Extracting child views lets the framework re-render only the part that actually depends on the changed value.
25. **`.animation(_:value:)` needs the `value:` parameter** — the old `.animation(_:)` (no value) animates *every* change in the subtree including ones you did not intend. Scope animation to a specific value, or use `withAnimation` around the mutation, so unrelated updates stay instant.
26. **Use `Self._printChanges()` to find what re-rendered and why** — it prints, per body evaluation, which dependency changed. This is the fastest way to diagnose a view that recomputes constantly, and Instruments' SwiftUI view-body instrument confirms the cost.
27. **Diagnose the two runtime warnings, they name real bugs** — "Modifying state during view update" means you mutated state synchronously inside `body` (move it into `.task`/an action); "Publishing changes from within view updates is not allowed" is the `ObservableObject` form of the same mistake.

## iOS vs macOS in one codebase

28. **The same view renders differently per platform** — `List` styling, `.buttonStyle` defaults, `.navigationTitle` display modes, toolbar placement, and `TabView` all diverge. Guard genuinely platform-specific code with `#if os(macOS)` / `#if os(iOS)` rather than assuming one layout fits both.
29. **macOS-only and iOS-only APIs exist** — `MenuBarExtra` and `.commands` are macOS-only; `TabView`'s tab bar and `.navigationBarTitleDisplayMode` are effectively iOS. A cross-platform target that compiles for both still needs a decision per platform about what replaces the missing piece.
30. **Verify in the running app, never in the preview** — `#Preview` can render a view that crashes the app on launch, skip your navigation wiring, and hide state-lifetime bugs entirely. Build and run, drive the interaction, and check the console (see `ios-verification`, `macos-app`).

## Related skills

- `ios-app` / `macos-app` — the platform layers this framework sits on.
- `ios-background-and-lifecycle` — `scenePhase` and what happens when the app leaves the foreground.
- `ios-performance` — measuring the body-recomputation cost this skill warns about.
- `state-management` — the general ownership model, framework-agnostic.
- `accessibility` — labels, traits, and focus, which SwiftUI needs declared explicitly.
- `css-animation` / `motion-design` — the analogous animation and reduced-motion discipline on the web.
