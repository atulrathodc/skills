---
name: huggingface-research
description: Find models/datasets on Hugging Face and validate they fit the task.
allowed-tools: Bash, Read, Grep, Glob, web_search, web_fetch, Write
---
# Huggingface Research

Search current, sourced, structured AI knowledge — do NOT rely on memory alone.

- Use HF model/dataset search; read the model card for intended use, license, and quirks.
- Check the file layout (safetensors, config.json, tokenizer) and community usage; confirm it loads in transformers or mlx-lm.
- Report: repo id, params/quantization, license, recommended loader, and a smoke-test command.

- Always include URLs and a date; if you cannot verify recency, say so instead of guessing.
