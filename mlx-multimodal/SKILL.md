---
name: mlx-multimodal
description: Vision-language / multimodal models on MLX (CLIP-style, VLM fine-tuning).
allowed-tools: Bash, Read, Write, Edit, Glob, Grep, web_search, web_fetch
---
# Multimodal — Vision-language / multimodal models on MLX (CLIP-style, VLM fine-tuning)

- - Convert vision encoder + projector + LM; keep the vision tower frozen vs train explicit.
- - Use the model's image processor; verify pre/post-conversion embeddings match.
- - Verify: joint VQA/image-text eval improves.
