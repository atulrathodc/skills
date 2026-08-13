---
name: parallel-work
description: Safely parallelize independent repository exploration and implementation tasks.
allowed-tools: Read, Grep, Glob, Bash
---

# Parallel Work

Parallelize only when tasks are independent.

Good candidates:

- independent file discovery
- unrelated test discovery
- independent documentation lookup
- separate module analysis

Do not parallelize operations that modify the same files or depend on each other's intermediate state.

Before parallel execution identify ownership boundaries.