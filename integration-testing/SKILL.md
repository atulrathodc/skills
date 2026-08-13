---
name: integration-testing
description: Design and run focused integration tests across real application boundaries.
allowed-tools: Read, Grep, Glob, Bash
---

# Integration Testing

Prefer testing real boundaries for:

- HTTP APIs
- database access
- queues
- filesystem behavior
- external adapters

Use mocks only where they provide a meaningful isolation boundary.

Keep integration tests deterministic and isolated.