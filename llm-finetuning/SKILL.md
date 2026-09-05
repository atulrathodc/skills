---
name: llm-finetuning
description: Fine-tune a pretrained LLM on a dataset (SFT-style).
allowed-tools: Bash, Read, Write, Edit, Glob, Grep
---
# Llm Finetuning

**When:** You have a base model and a task dataset; the model is not doing the task well.

1. Pick base + approach: full fine-tune (rare, needs GPU/local memory) vs PEFT/LoRA (default for single GPU / MLX).
2. Data: build a clean JSONL (instruction/completion or messages), dedupe, split train/val, mind contamination.
3. Train with a standard recipe (transformers+TRL SFTTrainer, Axolotl, LLaMA-Factory, or mlx-lm.lora) — lr ~1e-5..2e-5, cosine+warmup, epochs small (1-3); eval every few steps.
4. After training: run the target eval AND a general sanity set; merge LoRA if used.
Verify: task metric up, general quality not degraded, no overfit (val loss flat).
