───
---
name: orpo
description: ORPO (Odds-Ratio Preference Optimization) — single-stage supervised + preference alignment with no reference model.
allowed-tools: Bash, Read, Write, Edit, Glob, Grep
---
# ORPO

**When:** You want SFT and preference alignment in ONE stage with limited compute — and want to avoid holding a frozen reference model.

1. Single pass on (prompt, chosen, rejected) triples: no separate SFT-then-DPO, no reference copy. Joins the SFT next-token loss with a preference term — roughly `L = L_SFT + λ · L_OR`, where `L_OR` pushes up the **odds ratio** `odds(chosen)/odds(rejected)` with `odds(y|x) = π(y|x)/(1-π(y|x))`, widening the margin between accepted and rejected responses.
2. λ (the preference-strength weight) ~**0.1-0.5**; pick λ high enough to move preference share but not so high it destabilizes the SFT loss or nukes the LM likelihood. LR around 1e-6..2e-6 (it must behave like a fine-tune, not a hard RL update).
3. Because the policy's own current probabilities serve as the implicit reference, you save an entire reference-model forward pass and its weights — roughly 2× less memory than DPO/RLHF per step. Big win when VRAM is the constraint.
4. Use when you want one training stage and modest compute; with a strong, well-trained base the plain SFT term still teaches format while the odds term does alignment. Use it for preference data with clean chosen/rejected pairs and a base that isn't already over-aligned.
5. Pitfalls: ORPO is often **less stable and weaker than DPO** on already-strong/reasoning models, can drift the LM toward repetitive or degenerate text if λ is too high, and has no KL anchor to hold the reference distribution. Watch generation quality closely.

Verify: preference win-rate up AND format/instruction quality holds (ORPO can sacrifice the latter); no repetition/degeneration; memory profile ~half of DPO; evaluate with the SAME prompt set used for chosen/rejected.

───