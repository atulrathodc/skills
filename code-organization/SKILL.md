---
name: code-organization
description: Decide WHERE code goes — layering, module boundaries, and the structure that keeps a codebase maintainable.
allowed-tools: Read, Grep, Glob, Edit, Write
---

# Code Organization

Most maintainability problems are "where did the code go". Follow the repo's existing layering — don't invent a new one.

1. **Match the existing structure** — controllers/`routes`, services/`use cases`, models/`entities`/`types`, config, utils. A new feature should mirror the same pattern as its neighbors (same dirs, same naming).
2. **Layer rule** — a layer only talks to the layer beneath it: UI → controller/handler → service → data. Don't let a controller touch the DB directly or a view call an API in a service.
3. **One responsibility per file** — a file that does "auth + payments + logging" is three files. Extract until each file has one reason to change.
4. **Shared code goes UP** — if two places need it, extract a shared util/service at the lowest common layer (not duplicated in both).
5. **Domain vs infrastructure** — keep business rules (what the feature does) separate from plumbing (HTTP, DB, files). Business logic in services; plumbing at the edges.
6. **New abstraction only when it earns it** — prefer extending an existing service/controller/config over adding a new abstraction. Two users isn't a pattern; three+ is.
7. After a change, a newcomer should be able to find the new code by following the same paths as the existing code.
