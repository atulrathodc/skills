---
name: dependency-tracing
description: Trace code dependencies and references before modifying shared code.
allowed-tools: Read, Grep, Glob
---

# Dependency Tracing

Before changing a shared symbol:

- Find its definition.
- Find direct callers.
- Find implementations.
- Find interfaces and types.
- Find tests.
- Find configuration references.
- Find serialization/API consumers.
- Check whether the symbol crosses module boundaries.

Do not modify a shared API until its important consumers are understood.