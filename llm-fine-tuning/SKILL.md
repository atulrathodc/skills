---
name: llm-fine-tuning
description: LLM Fine-Tuning — llm dev guidance for AI/LLM development.
allowed-tools: Bash, Read, Write, Edit, Glob, Grep
---

# Llm Fine Tuning

- Building/adapting LLMs: pick a base (HF/mlx), define data & compute budget, choose full vs PEFT (LoRA family).
- Pretraining/SFT pipelines need reproducible config; use reference tooling (transformers, TRL, mlx-lm, Axolotl/LLaMA-Factory).
- Verify with an eval and a human sample; watch loss/overfit and contamination.
