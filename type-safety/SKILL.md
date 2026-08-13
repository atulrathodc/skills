---
name: type-safety
description: Improve type correctness without weakening existing type guarantees.
allowed-tools: Read, Grep, Glob, Bash
---

# Type Safety

- Prefer precise types.
- Avoid unnecessary `any`.
- Avoid unsafe casts.
- Preserve nullability guarantees.
- Reuse existing domain types.
- Update affected tests.
- Run the repository's type checker.

Never silence a type error without understanding its cause.