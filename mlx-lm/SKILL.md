---
name: mlx-lm
description: Run and fine-tune HF-style LLMs on MLX via the mlx-lm toolkit (convert, generate, LoRA).
allowed-tools: Bash, Read, Write, Edit, Glob, Grep, web_search, web_fetch
---
# mlx-lm — Run and fine-tune HF-style LLMs on MLX via the mlx-lm toolkit (convert, generate, LoRA)

- - `pip install mlx-lm`. Convert: `mlx_lm.convert --hf-path HF/MODEL -q` (quantized). Generate: `mlx_lm.generate --model <dir> --prompt "..."`.
- - LoRA train/fuse via `mlx_lm.lora`; serve via `mlx_lm.server`.
- - Verify generation quality + memory fit before training runs.
