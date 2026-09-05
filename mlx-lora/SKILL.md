---
name: mlx-lora
description: LoRA fine-tuning with Apple MLX (mlx-lm) — train low-rank adapters for task/domain adaptation on Apple Silicon unified memory.
allowed-tools: Bash, Read, Write, Edit, Glob, Grep
---

# MLX LoRA (mlx-lm)

LoRA trains low-rank adapter matrices instead of the full model — the realistic path to fine-tune large models on a Mac's unified memory.

1. **Install** — `pip install mlx-lm`; ensure the base model + training fit in RAM (quantize the base to shrink).
2. **Data** — JSONL, one record per line (`{"prompt": "...", "completion": "..."}` or `messages`) matching the model's chat template/tokenizer.
3. **Train**
   ```bash
   mlx_lm.lora --model HF_ORG/MODEL --train --data ./data \
     --iters 300 --batch-size 4 --num-layers 4 --rank 8 \
     --learning-rate 1e-5 --adapter-path adapters
   ```
   Tune `--num-layers` (last N blocks), `--rank`, `--iters`, `--batch-size`; watch reported loss/tok-s and peak memory.
4. **Eval / generate** — `mlx_lm.lora --model ... --test --adapter-path adapters`; then `mlx_lm.generate --model ... --adapter-path adapters --prompt "..."`.
5. **Merge** — `mlx_lm.fuse --model ... --adapter-path adapters --save-path fused-model`.

Pitfalls: adapters must match the base model/quantization at generate/fuse time; keep the base model id consistent between train and fuse. If OOM: lower batch/rank/layers or use a quantized base.
