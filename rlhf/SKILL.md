---
name: rlhf
description: Reinforcement learning from human feedback: train RM, then PPO/DPO to align.
allowed-tools: Bash, Read, Write, Edit, Glob, Grep
---
# Rlhf

**When:** Align to human preferences beyond next-token loss.

1. Collect preference data (chosen/rejected), train a reward model on pairs (accuracy ~70%+).
2. Policy optimization: PPO with RM rewards + KL-to-SFT-reference, or direct DPO from pairs.
3. Calibrate the RM; watch reward hacking (RM can be gamed) — keep KL and sampled-quality checks.
4. Iterate human data + RM + policy in rounds.
Verify: human-eval win-rate up; safety/general regressions flat.
