---
name: awq
description: AWQ — compression guidance for AI/LLM development.
allowed-tools: Bash, Read, Write, Edit, Glob, Grep
---

# Awq

- Compression = quantization/pruning/distillation/merging. Measure accuracy-vs-memory BEFORE shipping.
- Prefer established recipes (GPTQ/AWQ/FP8/INT4, safetensors/mlx quant, merge via SLERP/TIES).
- Verify: eval parity and size/speed gain on the target hardware.
