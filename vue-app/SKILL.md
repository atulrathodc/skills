---
name: vue-app
description: Build, run, and debug Vue 3 apps — SFC, script setup, reactivity, vue-router, Vite.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# Vue (3) App

Vue 3 specifics that trip up agents.

1. **Single-file components** — `<script setup>` + `<template>` + `<style>` in a `.vue` file. `script setup` is the modern default; match the app's style.
2. **Reactivity** — `ref()` for primitives (`count.value`), `reactive()` for objects, `computed()`. A template that doesn't update = missing `.value` or a non-reactive assignment (`obj.x = 1` on a `ref` object).
3. **Events/binding** — `v-model` for two-way input, `@click` for events, `v-for`/`v-if` in templates.
4. **Router** — `vue-router`: routes in `router/index.js`, `<router-view>`, `useRouter()/useRoute()`. A page that won't load = route path mismatch.
5. **API** — `fetch`/axios in a composable or store; never in a template. Vite proxy (`server.proxy`) for dev ↔ backend (see `frontend-backend-integration`).
6. **Run** — `npm install` then `npm run dev` (Vite) or `npm run build` + serve `dist/`. Verify with curl + browser console (see `make-it-run`, `ui-verification`).
7. **Vue 2 vs 3** — if the app uses the Options API (`data()`, `methods:`) it's Vue 2 or 3-Options; match that syntax, don't mix.
