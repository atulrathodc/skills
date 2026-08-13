---
name: resilience
description: Review external calls and distributed operations for failure and recovery behavior.
allowed-tools: Read, Grep, Glob, Bash
---

# Resilience

For external dependencies consider:

- timeout
- retry
- backoff
- cancellation
- circuit breaking
- idempotency
- partial failure
- fallback
- observability

Never add retries blindly.

Retries must account for whether the operation is safe to repeat.