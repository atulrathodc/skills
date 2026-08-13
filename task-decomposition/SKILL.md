---
name: task-decomposition
description: Break complex coding tasks into independently executable work units.
allowed-tools: Read, Grep, Glob
---

# Task Decomposition

Break the task into:

1. Understanding
2. Constraints
3. Dependencies
4. Implementation units
5. Tests
6. Verification

Each work unit should have:

- clear objective
- relevant files
- dependencies
- expected result
- verification method

Prefer small independently verifiable units.

Avoid creating artificial subtasks when the change is naturally atomic.