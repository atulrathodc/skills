---
name: early-stopping-analysis
description: Decide when a training run has converged and should stop, balancing compute spent against eval gains.
allowed-tools: Bash, Read, Grep, Glob
---

# Early Stopping Analysis

Complement to checkpoint-selection: know when MORE training is not worth it.

1. **Track a smooth eval metric** (EMA of val loss or a probe), not raw noisy steps.
2. **Define patience** — stop if no improvement for P eval windows; use your compute budget as the hard backstop (scaling-law-planning).
3. **Watch for overfit** — train loss still dropping while eval plateaus/rises → stop earlier; investigate data/contamination if eval rises then falls again.
4. **For RL/alignment** — stop when reward/KL tradeoff stalls or eval win-rate plateaus; reward hacking shows as reward up, quality down.
5. **Record** — chosen stopping step, metric, and compute spent, so the decision is auditable.

## Verification
- You can show that stopping at step X vs the final step yields equal-or-better eval, and state how much compute you saved.
