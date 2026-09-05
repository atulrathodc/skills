---
name: agent-rl
description: Train agents with RL on trajectories / environment rewards (agent-RL, RLVR for agents).
allowed-tools: Bash, Read, Write, Edit, Glob, Grep
---

# Agent RL

1. **Signal** — use environment/execution rewards (task success, tests, tool outcomes) or a learned RM over trajectories; deterministic exec rewards are cleanest.
2. **Data/rollouts** — sample agent trajectories in the real environment; score them; keep a reference policy + KL to avoid collapse.
3. **Algo** — start with RLVR/GRPO (verifiable rewards) or PPO with a trajectory RM; train on the agent's own actions, not just language.
4. **Safety of the loop** — bound steps/tokens, block repeated identical tool calls; reward honest completion over gaming.
5. **Eval** — success rate + cost on held-out tasks; watch for reward hacking (high reward, wrong behavior).

Verify: held-out task success up, cost bounded, no loops.
