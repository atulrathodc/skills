---
name: mlx-grpo
description: GRPO (group-relative policy optimization) style RL on MLX for reasoning/code models.
allowed-tools: Bash, Read, Write, Edit, Glob, Grep, web_search, web_fetch
---
# GRPO — GRPO (group-relative policy optimization) style RL on MLX for reasoning/code models

- - Sample a group per prompt, normalize advantages within the group, update with KL to reference.
- - Use verifiable rewards (exact/code exec/math) where possible to avoid reward hacking.
- - Verify: pass-rate up, response length sane; watch for reward hacking.
