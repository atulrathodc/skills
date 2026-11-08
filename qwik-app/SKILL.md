---
name: qwik-app
description: Build, run, and debug Qwik and Qwik City web apps — resumability, zero-hydration, component$ closures, loaders, and actions.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# Qwik App

Qwik / Qwik City specifics (Resumability, zero hydration, component$).

0. **Greenfield Scaffolding**:
   `npm create qwik@latest . -- --template basic && npm install`

1. **The `$` Boundary Rule**:
   - In Qwik, code is serialized into chunks via the `$` symbol:
     `export const MyComponent = component$(() => { ... })`
     `onClick$={() => { ... }}`
   - Any function passed to an event handler or hook MUST be wrapped in `$()`.

2. **State with `useSignal` and `useStore`**:
   - Primitive: `const count = useSignal(0)`. In JSX use `{count.value}`.
   - Objects/Arrays: `const state = useStore({ name: 'Mini' })`.

3. **Qwik City Routing**:
   - Routes live in `src/routes/`.
   - `index.tsx` for pages, `layout.tsx` for layout wrappers.
   - Server data: `routeLoader$(async () => { ... })`.
   - Form actions: `routeAction$(async (data) => { ... })`.

4. **Verify**:
   - `npm run dev` (Vite) / `npm run build`
   - Curl the page and verify HTML contains serialized state and zero immediate JS execution.
