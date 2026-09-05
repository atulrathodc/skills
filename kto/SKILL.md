---
name: kto
description: KTO — posttrain guidance for AI/LLM development.
allowed-tools: Bash, Read, Write, Edit, Glob, Grep
---

# Kto

- Post-training = alignment/preference/RL stage after SFT. Choose the method by data (pairs vs groups vs rewards) and tooling (TRL, verl, mlx).
- Prefer reference implementations (DPO/GRPO/PPO/RLHF) over re-deriving; keep an anchor/KL and eval.
- Verify: target metric up, quality/regression evals flat, no reward hacking.
