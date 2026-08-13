---
name: incident-response
description: Respond to production incidents methodically instead of guessing.
allowed-tools: Read, Grep, Glob, Bash
---

# Incident Response

- Confirm the symptom and scope before changing anything.
- Check recent deploys and config changes first — most incidents are changes.
- Read logs and metrics from the time of the incident, not just the current state.
- State a hypothesis before acting; test it, then act.
- Prefer the smallest change that restores service; then find the root cause.
- Track what was tried so you do not repeat failed actions.
- After recovery, capture the root cause and a follow-up to prevent recurrence.
- Do not call it fixed because the symptom stopped — find why it stopped.
