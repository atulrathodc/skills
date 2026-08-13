---
name: safe-refactoring
description: Perform behavior-preserving refactors with incremental verification.
allowed-tools: Read, Grep, Glob, Bash
---

# Safe Refactoring

Before refactoring:

- identify current behavior
- identify consumers
- identify tests
- establish a verification baseline

During refactoring:

- preserve behavior
- make incremental changes
- avoid mixing unrelated features

After refactoring:

- run affected tests
- compare behavior
- inspect the final diff