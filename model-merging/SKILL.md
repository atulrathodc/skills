---
name: model-merging
description: Model Merging — compression guidance for AI/LLM development.
allowed-tools: Bash, Read, Write, Edit, Glob, Grep
---

# Model Merging

- Compression = quantization/pruning/distillation/merging. Measure accuracy-vs-memory BEFORE shipping.
- Prefer established recipes (GPTQ/AWQ/FP8/INT4, safetensors/mlx quant, merge via SLERP/TIES).
- Verify: eval parity and size/speed gain on the target hardware.
