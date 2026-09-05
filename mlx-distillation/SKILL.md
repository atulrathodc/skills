---
name: mlx-distillation
description: Distill a large teacher into a smaller MLX model (logits or preference distillation).
allowed-tools: Bash, Read, Write, Edit, Glob, Grep, web_search, web_fetch
---
# Distillation — Distill a large teacher into a smaller MLX model (logits or preference distillation)

- - Teacher generate labels/traces; student trains on teacher logits/probabilities (KL) or preference pairs.
- - Prefer offline distillation data generation; monitor student vs teacher gap.
- - Verify: student matches teacher on the target eval while being smaller/faster.
