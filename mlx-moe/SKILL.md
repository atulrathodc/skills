---
name: mlx-moe
description: Mixture-of-Experts models on MLX — routing, expert loading, efficiency.
allowed-tools: Bash, Read, Write, Edit, Glob, Grep, web_search, web_fetch
---
# MoE — Mixture-of-Experts models on MLX — routing, expert loading, efficiency

- - Implement experts as separate mlx modules with a router; keep only active experts compute-heavy.
- - Watch memory: with unified memory, large MoE can still fit if experts are weight-shared/quantized.
- - Verify: router load balance and no expert collapse; compare FLOPs/throughput.
