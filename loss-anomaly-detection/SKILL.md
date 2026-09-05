---
name: loss-anomaly-detection
description: Detect and fix training anomalies: loss spikes, divergence, NaN/Inf, plateau, and silent regressions during LLM training.
allowed-tools: Bash, Read, Write, Edit, Glob, Grep
---

# Loss-Anomaly Detection & Debugging

When a run stops improving or blows up, diagnose before changing the recipe blindly.

1. **Classify the anomaly**:
   - Spike then recover → usually transient (LR spike, data batch issue) — often safe.
   - Divergence to NaN/Inf → numeric: LR too high, grad clip off, bf16 overflow, bad init/data.
   - Plateau early → LR/schedule or data mix issue, or the model is too small for the loss target.
   - Silent eval regression while train loss drops → overfitting/contamination, not a training bug.
2. **Instrument** — log loss per step + EMA, grad norm, param norm, lr, tok/s, and val loss at fixed intervals. A loss spike without a grad-norm spike points at data, not the optimizer.
3. **Act by cause**:
   - Divergence: reduce LR, add/enforce grad clipping, check bf16/fp32 casting, verify init std.
   - Spikes from data: inspect/remove the offending batch (dedupe, filter).
   - Plateau: adjust LR schedule/warmup, tune data mix, consider model size (scaling-law-planning).
4. **Verify** — reproduce the fix on a small spike first; confirm the metric that matters (val loss / eval) actually improved, not just train loss.

## Verification
- You can name the anomaly class, the evidence (grad-norm vs loss), the cause, the fix, and show the loss recovering on a controlled re-run.
