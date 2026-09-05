---
name: code-fine-tuning
description: Code Fine-Tuning — coding ai guidance for AI/LLM development.
allowed-tools: Bash, Read, Write, Edit, Glob, Grep
---

# Code Fine Tuning

- Code models: pretrain/SFT on code, then prefer execution-based signals (unit tests, compile) for RL/eval.
- Use repository-level context and realistic SWE tasks; guard against contamination.
- Verify: test-pass / execution-based scores improve.
