---
name: verifier-training
description: Train a verifier/process-supervisor that judges partial or final correctness.
allowed-tools: Bash, Read, Write, Edit, Glob, Grep
---
# Verifier Training

**When:** You want step-level or answer-level verification to guide RL/search.

1. Collect correctness labels at answer level (verifiable) or step level (process supervision).
2. Train a verifier to predict correctness; for process supervision label each step's contribution.
3. Use the verifier to rerank sampled outputs (best-of-N) or as reward in RLVR.
4. Evaluate verifier accuracy vs ground truth; calibrate thresholds.
Verify: verifier accuracy high; downstream selection/RM gains real.
