---
name: reasoning-training
description: Train reasoning behavior: long CoT, RLVR on verifiable tasks, or CoT distillation.
allowed-tools: Bash, Read, Write, Edit, Glob, Grep
---
# Reasoning Training

**When:** Model answers fast/wrong on multi-step problems.

1. Data/trace: verifiable multi-step tasks (math/code); collect or distill long-CoT traces.
2. Stage: SFT on correct traces → RLVR/GRPO with verifiable rewards on harder prompts.
3. Control reasoning length (token budget) and format; add self-consistency at eval.
4. Eval pass@k and length; watch for overlong/degenerate reasoning.
Verify: reasoning/math/code evals up, general quality stable, no reward/format hack.
