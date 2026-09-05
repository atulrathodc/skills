---
name: quantization
description: Quantize LLM weights (4/8-bit, weight-only or groupwise) to cut memory/inference cost while preserving quality.
allowed-tools: Bash, Read, Write, Edit, Glob, Grep
---

# Quantization

1. **Choose type** — weight-only (most inference tools), groupwise per-channel (bits 4/8), or KV-cache/activation for extra savings. NF4/INT4/FP8 are the common presets.
2. **Apply with the right tool** — MLX: `mx.quantize` / `mlx_lm.convert -q`; vLLM: AWQ/GPTQ/FP8 checkpoints; llama.cpp: GGUF `Q4_K_M`. Keep the SAME bits/group when loading.
3. **Measure the tradeoff** — eval loss + a real benchmark BEFORE and AFTER; report accuracy-vs-memory. 4-bit often keeps quality; below 4-bit usually degrades unless carefully tuned.
4. **Pitfalls** — outliers hurt; consider keeping sensitive layers (embeddings, norms, last layers) higher precision; watch for calibration-set overfit in GPTQ/AWQ.
5. **Verify** — coherent generation + eval parity on your task; memory within the target machine.

Report: bits/group, memory saved, accuracy delta, and generation sanity.
