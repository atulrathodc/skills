---
name: solid-app
description: Build, run, and debug SolidJS apps — signals, JSX reactivity, createEffect, Vite.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# SolidJS App

SolidJS specifics — reactivity is signals, not state objects.

1. **Signals** — `const [count, setCount] = createSignal(0)`; read `count()`, write `setCount(1)`. Accessing `count` WITHOUT `()` is a bug.
2. **Derived/memo** — `createMemo(() => count() * 2)` recomputes when its signals change; use it (not a plain function) so the template stays reactive.
3. **Effects** — `createEffect(() => console.log(count()))` runs when tracked signals change. A "doesn't update" bug = the value wasn't tracked (read outside a reactive scope).
4. **JSX** — Solid uses JSX but NOT React's rules: `onClick`, `{items().map(...)}` (call the signal). Props are read-only reactive.
5. **Control flow** — `<Show when={...}>`, `<For each={items()}>` replace `v-if`/`v-for`. Conditional rendering in a ternary can break reactivity.
6. **Run** — Vite: `npm run dev`, `npm run build` → `dist/`. Verify with curl + browser console (see `make-it-run`, `ui-verification`).
