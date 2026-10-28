───
---
name: simpo
description: SimPO (Simple Preference Optimization) — reference-free preference alignment with a length-normalized implicit reward and target margin.
allowed-tools: Bash, Read, Write, Edit, Glob, Grep
---
# SimPO

**When:** You have chosen/rejected pairs, want DPO-level alignment without keeping a reference model, and want to stop the model gaming by being verbose.

1. Reference-free: the implicit reward is the **length-normalized average log-probability** of the response under the policy, `(1/|y|)·Σ log π(y_t|x)`. No `π_ref`, no KL anchor, no second forward pass — halves memory vs DPO and avoids separately tuning a reference model.
2. Objective is a margin-based Bradley-Terry: push `reward(chosen)` above `reward(rejected)` plus a fixed target margin `γ`:
   `L = -log σ( β·[ (1/|y_w|)Σlogπ − (1/|y_l|)Σlogπ − γ ] )`.
   It wants a literal gap, not just "chosen > rejected".
3. **Length normalization is the point**: averaging log-prob by length removes the per-token advantage long responses got in plain DPO/DPO-ish objectives, so the model can't inflate scores by producing longer, rambling output. Reward is scale-invariant to response length.
4. Hyperparams: β ~**2.0-2.5** (temperature that amplifies the reward difference) and γ ~**0.5-1.5** (how big a margin to enforce). β too low underuses the signal; γ too high is unsatisfiable and stalls the policy.
5. SimPO typically **beats DPO** on chat/instruction win-rate and length-control when the reference model is weak or mismatched, and it's simpler to deploy (no ref copy). Works best after a decent SFT init and on clean pairs; pairs from a different/lower-quality reference still fine since state is reference-free.

Verify: win-rate vs DPO baseline up, average response length stable (not growing), no reward hacking/format collapse; confirm the margin term is actually being satisfied (chosen-rejected gap ≈ γ) not just loss going down.

───