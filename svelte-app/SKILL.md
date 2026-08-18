---
name: svelte-app
description: Build, run, and debug Svelte apps — .svelte components, reactive statements, onMount, Vite.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# Svelte App

Svelte specifics that trip up agents.

1. **Components** — a `.svelte` file = `<script>` + markup + `<style>` (scoped by default). Props via `export let`.
2. **Reactivity** — `let count = 0; $: doubled = count * 2;` — the `$:` label recomputes when its deps change. A stale value = the variable was reassigned in a way Svelte can't track (mutated an object property instead of reassigning).
3. **Events/loops** — `on:click`, `{#each items as item}`, `{#if}`. Two-way input with `bind:value`.
4. **Lifecycle** — `onMount()` for browser-only setup (fetch, event listeners). Guard against running on the server if SSR.
5. **Store** — `writable()`/`$store` for shared state (see `state-management`).
6. **Run** — `npm run dev` (Vite), `npm run build` → `dist/`. Verify with curl + browser console (see `make-it-run`, `ui-verification`).
