---
name: dependency-tracing
description: Trace code dependencies and references before modifying shared code.
allowed-tools: Read, Grep, Glob
---

# Dependency Tracing

Before modifying or removing shared code:

- Trace import/require chains to find every consumer of the symbol.
- Grep for the symbol across the repo, not just the current directory.
- Note indirect dependents (a consumer's consumer) when the change ripples.
- Check for dynamic references — string-based imports, reflection, plugin loading — that a plain grep may miss.
- Confirm the dependency direction: no cycles introduced by the change.
- List affected call sites and tests in your summary.

Do not modify shared code until every dependent is accounted for.
