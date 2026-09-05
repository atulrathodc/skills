---
name: ppo
description: Proximal Policy Optimization for LLMs: policy gradient with a reward model and KL control.
allowed-tools: Bash, Read, Write, Edit, Glob, Grep
---
# Ppo

**When:** Alignment where you have (or train) a reward model over full responses.

1. Components: policy (frozen reference), reward model (or programmatic reward), value or GAE.
2. Rollout: sample responses; score; compute advantages (GAE) + KL penalty to the reference.
3. Update with clipped surrogate (epsilon ~0.2); large batch, small LR; watch policy entropy.
4. Scale rollouts efficiently (vLLM rollout infra); monitor reward + KL + pass-rate.
Verify: reward up without collapse (KL & sample quality), stable loss, eval gains.
