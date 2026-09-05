---
name: mlx-rl
description: RL for LLMs on MLX (rollouts + reward + policy update in mlx training loops).
allowed-tools: Bash, Read, Write, Edit, Glob, Grep, web_search, web_fetch
---
# RL on MLX — RL for LLMs on MLX (rollouts + reward + policy update in mlx training loops)

- - mlx-rl/mlx examples: collect rollouts, compute rewards, apply PPO/GRPO-style updates with mlx autograd.
- - Keep a reference/anchor policy and a KL term to avoid collapse; reuse an SFT base.
- - Verify: reward and KL tracked, no collapse, small benchmark improves.
