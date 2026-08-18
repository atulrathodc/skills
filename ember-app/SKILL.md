---
name: ember-app
description: Build, run, and debug Ember apps — routes, templates, components, ember-data, CLI.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# Ember App

Ember specifics (Octane-era conventions).

1. **CLI** — `ember serve` (dev), `ember build` (to `dist/`), `ember generate route <name>` / `component`. Use the CLI over hand-writing boilerplate.
2. **Routes + templates** — a route (`app/routes/<name>.js`) + template (`app/templates/<name>.hbs`); `{{@arg}}` (arguments) and `{{this.x}}` (local) in templates.
3. **Components** — `app/components/<name>.js` + `.hbs`, `{{<Name>}}` usage. Classic vs Glimmer component differences matter; match the app's version.
4. **Data (ember-data)** — `this.store.findAll('model')` / `findRecord`; a query that returns nothing = wrong model name or a serializer mismatch.
5. **Actions** — `{{on "click" this.save}}` (modifier) with `@action save() {}` in the component class.
6. **Proxy** — `ember-cli-build.js` / `config/environment.js` API host for frontend↔backend (see `frontend-backend-integration`).
7. **Run** — `ember serve`, verify with curl + browser console (see `make-it-run`, `ui-verification`).
