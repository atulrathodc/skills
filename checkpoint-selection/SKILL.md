---
name: checkpoint-selection
description: Select the best checkpoint and decide when to stop an LLM training run (early stopping) without overfitting or wasting compute.
allowed-tools: Bash, Read, Write, Edit, Glob, Grep
---

# Checkpoint Selection & Early Stopping

Pick the right model, not just the last one.

1. **Save often + stream** — checkpoint every K steps with full optimizer/state so any point is resumable; keep metadata (step, loss, tok/s, config hash).
2. **Evaluate periodically** — run your real eval suite (val loss + downstream probes) on checkpoints, not only at the end. Watch for train-loss-down but eval-flat or eval-down (overfit / contamination).
3. **Select by eval, not train loss** — choose the checkpoint that maximizes your target metric; for preference/RL use the aligned eval, not just SFT loss.
4. **Early stop** — stop when the eval metric plateaus (patience on a moving window) or a fixed token budget is hit; for scaling-law runs, stop when the fitted loss target is reached.
5. **Ablate** — keep 2–3 candidate checkpoints and pick via a final human/held-out check.

## Verification
- You can say exactly which checkpoint you chose, why (the eval number), and confirm a later or earlier checkpoint did NOT beat it. Keep it reproducible.
