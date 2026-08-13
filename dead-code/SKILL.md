---
name: dead-code
description: Identify unused code safely before removing it.
allowed-tools: Read, Grep, Glob, Bash
---

# Dead Code

Before removing code:

- search references
- check dynamic usage
- check configuration references
- check tests
- check public API exposure
- check generated-code relationships

Only remove code when there is sufficient evidence that it is unused.