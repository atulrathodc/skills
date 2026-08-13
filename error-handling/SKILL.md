---
name: error-handling
description: Design consistent and useful error handling without hiding failures.
allowed-tools: Read, Grep, Glob, Bash
---

# Error Handling

- Preserve useful error context.
- Handle errors at the appropriate boundary.
- Do not silently swallow exceptions.
- Do not use generic catches when specific handling is possible.
- Preserve error semantics across layers.
- Return appropriate API errors.
- Log actionable information without secrets.