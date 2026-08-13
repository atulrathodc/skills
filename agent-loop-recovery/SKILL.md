---
name: agent-loop-recovery
description: Recover from repeated failures, stalled execution, and tool-call loops.
allowed-tools: Read, Grep, Bash
---

# Agent Loop Recovery

When execution appears stuck:

1. Detect repeated tool calls, commands, files, or errors.
2. Determine whether the agent is making meaningful progress.
3. Feed the latest failure and relevant evidence back into the next reasoning step.
4. Do not blindly repeat an unsuccessful action.
5. Change strategy when the same approach fails repeatedly.
6. Preserve successful work already completed.
7. Read `.mini/loop-resume.json` when available.
8. Continue from the last known progress point instead of restarting discovery.
9. Recalculate the remaining task scope after recovery.
10. Stop only when:
   - the task is complete,
   - the task is genuinely blocked,
   - or required information/action is unavailable.

A loop detection event is a recovery signal, not automatically a fatal error.

Never ask the user for additional budget merely because a recovery cycle occurred.