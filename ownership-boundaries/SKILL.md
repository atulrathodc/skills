---
name: ownership-boundaries
description: Prevent concurrent agents from conflicting over shared files and symbols.
allowed-tools: Read, Grep, Glob
---

# Ownership Boundaries

Before parallel modification:

- assign file ownership
- identify shared symbols
- identify generated files
- identify shared configuration
- identify dependency conflicts

Only one worker should own a file at a time unless the system supports safe patch merging.

Merge changes only after verifying compatibility.