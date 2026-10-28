───
---
name: kto
description: KTO (Kahneman-Tversky Optimization) — align from unpaired binary desirable/undesirable labels, no preference pairs needed.
allowed-tools: Bash, Read, Write, Edit, Glob, Grep
---
# KTO

**When:** You have abundant thumbs-up/down or desirable/undesirable feedback on single responses — but few or no chosen/rejected pairs for DPO.

1. Data is unpaired: per prompt you have responses labelled desirable vs undesirable, not two answers to compare. This lets you use organic log feedback / filtered (x, y-good, y-bad) pools without needing pairs.
2. Objective is prospect-theory-inspired: update toward desirable and away from undesirable with **asymmetric loss aversion** — penalizing undesirable examples more strongly than rewarding desirable ones (people weigh loss ~2× gain). The implicit reward is `β log(π(y|x)/π_ref(y|x))` (the DPO log-ratio) but applied per-response, anchored at the reference/preference point.
3. Keep a reference (SFT) model frozen as the KL anchor so the policy doesn't drift/forget; β controls how hard it exploits the label signal. No reference-state normalizer needed — it uses the KL anchor directly.
4. Balance your label ratio: feed roughly **1:1 up to 1:1.3 desirable:undesirable**; heavily skewed or too-few-positives data collapses the estimate of the target reward. Use β ~0.1-1.0 and a modest LR (~2e-7..1e-6 for the β-scaled loss on a frozen ref).
5. Unlike DPO (needs pairs, implicit pairwise objective), KTO needs only a binary label per response — choose KTO when pairs are scarce or labels are natural; choose DPO when you have clean pairs. KTO is noisier per-example, so it wants larger data.

Verify: desirable-rate and win-rate up on held-out labels; general instruction quality flat (no drift from the reference anchor); sensitivity to the label ratio is understood — no collapse when positives are rare.

───