---
name: concurrency-safety
description: Review concurrent code for races, deadlocks, and unsafe shared state.
allowed-tools: Read, Grep, Glob, Bash
---

# Concurrency Safety

Check:

- shared mutable state
- race conditions
- locking
- deadlocks
- ordering assumptions
- async cancellation
- thread safety
- duplicate execution
- idempotency

Do not introduce concurrency merely for speed.

Prefer deterministic behavior.