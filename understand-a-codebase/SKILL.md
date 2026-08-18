---
name: understand-a-codebase
description: Quickly understand an unfamiliar codebase — entry points, architecture, data flow, and the fastest way to find the right file.
allowed-tools: Read, Grep, Glob, List
---

# Understand a Codebase

The agent's first job is understanding. Find the RIGHT files fast — don't read the whole repo.

1. **Start from the manifest** — `package.json`/`pom.xml`/`requirements.txt`/`Cargo.toml`: the `start`/`build`/`test` scripts, the main entry, the framework. This is the map.
2. **Find the entry point** — the `main` / `app.listen` / `uvicorn` / `public static void main` — then trace what it wires together (routes, middleware, services, config).
3. **Map the architecture in ~5 reads** — one file per layer: entry point, a controller/route, a service, a model/entity, a config. That gives the skeleton.
4. **Use Grep, not reads** — to find where a SYMBOL is used: `Grep('symbolName')`. To find a file by name: `Glob('**/*name*')`. Reading files top-to-bottom to "understand" is the slow path.
5. **Trace the DATA FLOW for the feature you're changing** — request → controller → service → repository/DB → response. Follow ONE path end to end before editing anything.
6. **Note the conventions** — how errors are handled, how tests are named, how config is loaded — then match them. Don't invent a parallel style.
7. Only change files once you can name the exact file:line that owns the behavior you're modifying.
