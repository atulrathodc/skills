---
name: angular-app
description: Build, run, and debug Angular (2+) apps — CLI, components/services/routing, proxy, build.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# Angular (2+) App

Angular specifics that trip up agents.

1. **CLI is the tool** — `ng serve` (dev), `ng build` (production to `dist/`), `ng generate component <name>` (scaffold). Prefer the CLI over hand-writing boilerplate.
2. **Structure** — components (template + class + styles), services (DI, `@Injectable({providedIn:'root'})`), routing (`app-routing.module.ts` / `Routes` array), modules. Match the existing pattern.
3. **HTTP** — `HttpClient` is injected via constructor (see `dependency-injection`); API calls go through a service, not directly in a component.
4. **Dev proxy** — `proxy.conf.json`: `{ "/api": { "target": "http://localhost:<backendPort>", "secure": false } }`, wired in `angular.json` (`serve.options.proxyConfig`). Use it for frontend↔backend (see `frontend-backend-integration`).
5. **Build errors** — the FIRST error in `ng build` names the file (template compile errors, missing imports, type errors). Fix that, not the cascade.
6. **`zone.js`/runtime blank page** — a browser runtime error (undefined property in a template, failed DI) throws to the console; check the browser console (see `ui-verification`).
7. **Verify** — `ng build` clean, `ng serve` running, curl the page + an API call through the proxy.
