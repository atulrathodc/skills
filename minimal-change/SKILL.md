---
name: minimal-change
description: Implement the smallest safe change that satisfies the requested behavior.
allowed-tools: Read, Grep, Glob, Bash
---

# Minimal Change

- Modify only what is necessary.
- Preserve existing architecture.
- Avoid unrelated refactoring.
- Reuse existing utilities.
- Preserve public contracts.
- Avoid speculative abstractions.
- Keep the diff easy to review.

If a broader refactor is genuinely required, explain why before expanding scope.