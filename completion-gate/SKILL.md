---
name: completion-gate
description: Prevent the agent from declaring a task complete without sufficient verification.
allowed-tools: Read, Grep, Glob, Bash
---

# Completion Gate

Before completion:

- requested behavior implemented
- relevant files changed
- tests executed
- tests passed or failures explicitly explained
- build/type checks completed when applicable
- final diff inspected
- no unintended changes
- no unresolved critical errors

If verification is incomplete, do not claim full completion.