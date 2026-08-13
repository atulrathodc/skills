---
name: merge-conflict-resolution
description: Resolve merge conflicts without losing either side's intent.
allowed-tools: Read, Grep, Glob, Bash
---

# Merge Conflict Resolution

- Read both sides of every conflict — ours AND theirs — before choosing.
- Understand why the conflict exists: the same code changed on both sides.
- Keep both intents when they are complementary; choose deliberately when they conflict.
- Do not resolve by deleting one side wholesale unless it is truly obsolete.
- Check for missed markers (`<<<<<<<`, `=======`, `>>>>>>>`) after editing.
- Verify the merged result: run the build and tests after resolving.
- Confirm the resolved diff compiles and behaves as both sides expected.
