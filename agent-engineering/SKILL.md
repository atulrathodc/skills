---
name: agent-engineering
description: Build reliable LLM agents: tools, memory, planning, and control loops that converge instead of looping.
allowed-tools: Bash, Read, Write, Edit, Glob, Grep
---

# Agent Engineering

1. **Loop & state** — the agent is a loop: perceive → decide → act → observe. Keep state explicit (a task list/memory) so it doesn't re-plan from scratch each turn.
2. **Tools** — expose a SMALL set of real tools with clear schemas (Read/Edit/Bash/search/code). A tool call is verifiable; prefer execution feedback (tests, HTTP, exit codes) over text claims.
3. **Control** — cap turns/tokens; add budget, dedupe repeated identical actions, and block obvious loops (same tool+args repeated). Stop → delegate → done, not infinite grind.
4. **Planning** — for multi-step work use a concrete step list (todo) kept up to date; re-plan only on new evidence, not every turn.
5. **Recovery** — on failure, classify (tool error vs plan wrong vs env) and take the matching action; never blindly retry identical calls.

Verify: task success rate + cost (steps/tokens) + no loops; instrument each run.
