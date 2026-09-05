---
name: scaling-law-planning
description: Pick model size N and tokens D for a from-scratch training run from your compute budget, using scaling-law / isoFLOP estimates.
allowed-tools: Bash, Read, Grep, Glob, Write, web_search, web_fetch
---

# Scaling-Law Planning / Compute Budget

Decide N and D BEFORE writing model code. This is the highest-leverage from-scratch decision.

1. **Estimate your budget** — total GPU/MLX-hours you can actually spend. Model it as C = 6·N·D FLOPs (approximate) and convert to time on your hardware using your measured tok/s (not paper numbers).
2. **Pick the regime** — is your budget "compute-optimal" (isoFLOP/Chinchilla: D ≈ 20·N) or are you data-limited (then push tokens, shrink N) or compute-limited?
3. **Use scaling-law fits** — loss(N,D) ≈ a·N^-α + b·D^-β + c. Fit the constants on a few small spikes (see below), then solve for the (N,D) that reaches your target loss within budget.
4. **Sanity-check feasibility** — expected wall-time, memory fit, checkpoint storage, data size available. If any is off, shrink scope.
5. **Plan experiments** — a spike sweep (e.g. 3–4 small models) to fit the law costs a little and saves weeks.

## Verification
- You can state: given C FLOPs and a target loss, here is (N, D), expected time, and the memory/storage it needs.
- The full run's achieved loss lands near the prediction. Be explicit about assumptions (data quality, MFU, tok/s).
