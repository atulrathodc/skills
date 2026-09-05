---
name: qlora
description: QLoRA-style: quantize the base to 4-bit and train LoRA on top — big models on small memory.
allowed-tools: Bash, Read, Write, Edit, Glob, Grep
---
# Qlora

**When:** Model too big to train even with LoRA; need 4-bit base.

1. Load base quantized (4-bit NF4 or mlx 4-bit) with LoRA adapters on the dequantized projections.
2. Use paged/streamed optimizer states & gradient checkpointing to cut memory; batch small.
3. Train adapters; keep base frozen & quantized; watch for quantization-induced instability.
4. Merge adapters with the quantized base for inference at 4-bit (or re-quantize a fused fp16).
Verify: eval close to LoRA-on-fp16 baseline; memory fits; generation coherent.
