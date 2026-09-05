---
name: mlx-kernels
description: Custom Metal kernels for MLX ops (custom ops, fused attention/quantization).
allowed-tools: Bash, Read, Write, Edit, Glob, Grep, web_search, web_fetch
---
# Custom kernels — Custom Metal kernels for MLX ops (custom ops, fused attention/quantization)

- - Write a Metal shader, register as an mlx custom op with gradient if trainable.
- - Start from mlx examples (custom attention/quant) and verify numeric parity with a Python reference.
- - Verify: correctness (allclose) and a real speedup before using in training.
