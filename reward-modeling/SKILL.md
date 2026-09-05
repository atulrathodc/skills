---
name: reward-modeling
description: Train a reward model (RM) over (prompt, response) pairs to score outputs.
allowed-tools: Bash, Read, Write, Edit, Glob, Grep
---
# Reward Modeling

**When:** You need a learned reward for RL/alignment or ranking.

1. Data: preference pairs with the same prompt; balance chosen/rejected quality; avoid ties.
2. Train pairwise (Bradley-Terry) — accuracy target ~65-75%; calibrate score margins.
3. Validate on held-out pairs and human agreement; watch for shortcut/reward-hack signals.
4. Use as RM in PPO or to filter/rank data.
Verify: held-out pairwise accuracy + correlation with human preference.
