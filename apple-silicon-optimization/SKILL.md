---
name: apple-silicon-optimization
description: General Apple-Silicon LLM optimization: unified memory, Metal, quantization, deployment.
allowed-tools: Bash, Read, Write, Edit, Glob, Grep, web_search, web_fetch
---
# Apple Silicon — General Apple-Silicon LLM optimization: unified memory, Metal, quantization, deployment

- - Fit model+activations in unified memory (quantize or shard); avoid CPU/GPU copies.
- - Prefer MLX/mlx-lm, Metal kernels; compare against llama.cpp for inference.
- - Verify: coherent output, acceptable tok/s and memory; benchmark across configs.
