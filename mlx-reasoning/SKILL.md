---
name: mlx-reasoning
description: Training / evaluating reasoning behavior (long CoT, self-consistency, RLVR) on MLX.
allowed-tools: Bash, Read, Write, Edit, Glob, Grep, web_search, web_fetch
---
# Reasoning — Training / evaluating reasoning behavior (long CoT, self-consistency, RLVR) on MLX

- - Fine-tune or RL on long chain-of-thought / verifiable-reason traces; evaluate with pass@k / self-consistency.
- - Budget tokens: control max reasoning length; use test-time scaling by sampling multiple traces.
- - Verify: reasoning evals improve without losing non-reasoning accuracy.
