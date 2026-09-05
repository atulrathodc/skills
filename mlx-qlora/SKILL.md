---
name: mlx-qlora
description: QLoRA-style quantization-aware LoRA on MLX for large models in limited unified memory.
allowed-tools: Bash, Read, Write, Edit, Glob, Grep, web_search, web_fetch
---
# QLoRA — QLoRA-style quantization-aware LoRA on MLX for large models in limited unified memory

- - mlx supports quantized base + LoRA: quantize the base (4-bit) then train low-rank adapters on top.
- - Lower rank/batch to fit memory; keep the same quantization when fusing/generating.
- - Verify eval improves vs base and memory stays within the machine.
