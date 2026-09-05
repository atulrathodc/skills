---
name: agent-evaluation
description: Evaluate an LLM agent properly: task success in the real environment, not static text.
allowed-tools: Bash, Read, Write, Edit, Glob, Grep
---

# Agent Evaluation

1. **Use the environment** — success = completing the actual task (tests pass, file correct, HTTP works), not a judged paraphrase. Automate the grader where possible.
2. **Track cost** — report success AND steps/tokens/latency; an agent that succeeds in 50 steps isn't better than one at 5.
3. **Robustness** — run multiple seeds/paths; measure variance; include out-of-distribution tasks.
4. **Beware gaming** — an agent may optimize the grader; use held-out tasks and human spot-checks.
5. **Baselines** — compare vs a direct (non-agent) solve and vs a stronger/weaker agent.

Report: success@N, avg steps/tokens, failure modes (loop, wrong tool, env), and cost.
