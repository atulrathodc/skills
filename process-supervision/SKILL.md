---
name: process-supervision
description: Supervise an LLM's step-by-step reasoning/process (PRM) to catch errors mid-chain.
allowed-tools: Bash, Read, Write, Edit, Glob, Grep
---

# Process Supervision

1. **Label at steps** — for a trace, label each reasoning step correct/incorrect (PRM) rather than only the final answer; this finds wrong chains that still reach the right answer (or fail late).
2. **Collect data** — from verifiable tasks (math/code), generate steps + per-step correctness; human labels for harder cases.
3. **Train** — a process reward model scores steps; use it to select longer/partial rollouts or guide search.
4. **Use** — best-of-N reranking by the PRM, or as the reward in RL; combine with an outcome check as the final gate.
5. **Eval** — PRM accuracy vs step labels, and whether using it improves final-answer accuracy.

Verify: step-accuracy of the PRM + real downstream gain on the target task.
