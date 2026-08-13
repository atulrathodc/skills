---
name: context-management
description: Keep agent context focused and prevent unnecessary context growth.
allowed-tools: Read, Grep, Glob
---

# Context Management

- Keep only task-relevant information in active context.
- Prefer summaries for completed exploration.
- Avoid repeatedly injecting the same file contents.
- Reference previously discovered files instead of rereading them unnecessarily.
- Preserve decisions, constraints, failures, and progress.
- Compact when context becomes unnecessarily large.
- Never discard information required to resume execution.