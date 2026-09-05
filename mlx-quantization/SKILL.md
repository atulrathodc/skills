---
name: mlx-quantization
description: Quantize MLX models (4/8-bit weight-only, groupwise) to shrink unified-memory footprint.
allowed-tools: Bash, Read, Write, Edit, Glob, Grep, web_search, web_fetch
---
# Quantization — Quantize MLX models (4/8-bit weight-only, groupwise) to shrink unified-memory footprint

- - `mx.quantize` per layer with bits+group_size, or `mlx_lm.convert -q`.
- - Always measure accuracy-vs-memory (eval loss/benchmark before vs after).
- - Verify: coherent generation and memory within limit; keep bits/group consistent on load.
