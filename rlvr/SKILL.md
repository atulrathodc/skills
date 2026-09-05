---
name: rlvr
description: Reinforcement learning with verifiable rewards (math/code/proofs) using deterministic checks.
allowed-tools: Bash, Read, Write, Edit, Glob, Grep
---
# Rlvr

**When:** Tasks with exact answers where correctness is checkable (RLVR for reasoning).

1. Build verifier-based rewards: exact match, unit tests/compile, math check — deterministic.
2. Use GRPO/PPO over sampled rollouts with the verifier as reward; reward only on verified correctness.
3. Scale sampling for harder prompts; add KL/reference control to avoid collapse.
4. Eval with pass@k and length control.
Verify: verifiable pass-rate up; no reward hacking; length/cost bounded.
