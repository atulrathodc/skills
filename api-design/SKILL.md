---
name: api-design
description: Design consistent, discoverable, backwards-compatible APIs.
allowed-tools: Read, Grep, Glob
---

# API Design

- Name resources and operations consistently with the existing surface.
- Follow the conventions already in the repo (REST, JSON-RPC, typed functions).
- Prefer explicit, typed contracts over loose strings and maps.
- Make breaking changes explicit — version or migrate, never silently.
- Validate inputs at the boundary and return predictable errors.
- Document the contract where the codebase documents similar APIs.
- Check callers before changing an existing signature (see dependency-tracing).
