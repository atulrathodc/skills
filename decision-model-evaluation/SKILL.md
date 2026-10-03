---
name: decision-model-evaluation
description: Evaluate a decision/classification model (Jev, constrained-answer APIs, routers) before trusting it — labeled sets, per-class accuracy, calibration, threshold selection, baseline comparison, and drift.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# Decision Model Evaluation

A decision model does not output text you can skim — it outputs a label you will branch on. Evaluate the branching, not the model.

1. **Build the labeled set from real inputs** — sample production traffic, not examples you wrote while designing the schema. Stratify so rare-but-important classes are represented, and deliberately include the ambiguous and adversarial cases. Freeze it, version it, and never tune on it and then quote its score as held-out performance.
2. **Measure per class, never just aggregate** — 95% overall can hide 40% on the one class that routes to money or a destructive action. Report a confusion matrix and look at which pairs the model confuses; that is your schema-design feedback.
3. **Measure calibration separately from accuracy** — accuracy says how often it is right; calibration says whether `p = 0.9` actually means ~90%. Bin the predictions into a reliability curve and compute ECE/Brier. If everything comes back at 0.99, calibration is broken or your `state` is degenerate — treat that as a bug, not confidence.
4. **Choose the threshold from a cost model, not by feel** — pick the `p` cutoff from what a false positive and a false negative each cost you, then find the cutoff that meets the target precision on "act automatically". The right answer is usually to raise the bar and let the middle band fall through to a human or a rules path.
5. **Report the abstain rate** — a model that abstains on 30% of traffic may be fine or useless depending on who absorbs that 30%. The threshold and the fallback path are one decision, so evaluate them together.
6. **Beat the incumbent or don't ship it** — run your existing rules/heuristics over the same labeled set. A model that only matches the rules you already have adds a dependency, latency, and a vendor without adding value.
7. **A valid answer can still be wrong** — constrained models pick from your list, so a bad label is indistinguishable from a good one at the API layer. Keep authorization and policy checks in application code; the verdict is an input to a decision, never the decision itself.
8. **Watch for drift, on a schedule** — re-run the frozen set when inputs shift (new user population, new product area, a partner changing data), and monitor the live `p` distribution for a sudden shift. Compare against a dated snapshot rather than memory.
9. **Re-evaluate on every schema change** — editing the choice set, the `state` fields, or the model/mode version re-draws the boundary. A schema change without a re-run is an unmeasured regression.

## Related skills

- `jev-ai` / `jev-ai-integration` — the decision model this evaluation gates.
- `llm-evaluation` / `agent-evaluation` / `coding-evaluation` — evaluation practice for generative systems (this skill covers the constrained-answer case).
- `benchmarking` / `benchmark-search` — sourcing comparison numbers and baselines.
- `hallucination-evaluation` — the adjacent failure mode when the model is allowed to generate rather than select.
