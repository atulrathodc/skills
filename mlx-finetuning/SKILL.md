---
name: mlx-finetuning
description: Fine-tune an existing model on MLX (SFT-style full or LoRA).
allowed-tools: Bash, Read, Write, Edit, Glob, Grep, web_search, web_fetch
---
# Fine-tuning — Fine-tune an existing model on MLX (SFT-style full or LoRA)

- - Start from a converted/quantized base; prefer LoRA via mlx-lm unless you need full fine-tune.
- - Prepare JSONL (prompt/completion or messages), use the matching chat template/tokenizer.
- - Verify on held-out prompts and merge adapters (`mlx_lm.fuse`) only after it works.
