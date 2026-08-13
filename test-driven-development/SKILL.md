---
name: test-driven-development
description: Write a failing test first, then implement, then refactor.
allowed-tools: Read, Grep, Glob, Bash, Edit
---

# Test-Driven Development

For new behavior:

1. Write a test that fails for the right reason (feature absent, not test broken).
2. Run it and confirm it fails on the missing behavior.
3. Implement the minimal code to pass.
4. Run it and confirm green.
5. Refactor while keeping it green — no behavior change without a test.

Do not skip the red step. Do not weaken the test to make it pass. Cover the happy path and at least one edge or error path.
