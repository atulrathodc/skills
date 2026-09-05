---
name: continued-pretraining
description: Continue-pretrain an existing base model on new/domain data (domain-adaptive pretraining) — data prep, mixture, recipe, eval.
allowed-tools: Bash, Read, Write, Edit, Glob, Grep
---

# Continued Pretraining (Domain-Adaptive)

Train an existing base further on NEW or domain data (books, code, your corpus) to inject knowledge/domain skill — without losing general capability.

1. **Decide the goal** — knowledge injection (long-context/corpus) vs domain skill vs format. This chooses data mix and recipe.
2. **Data** — curate your domain corpus (dataset-engineering): filter/dedupe, and MIX with general data (e.g. 50–90% domain + 10–50% general) to avoid catastrophic forgetting.
3. **Recipe** — lower LR than pretraining (e.g. ~1/3 to 1/10 of peak), modest tokens (often 10–30% of a from-scratch budget), keep the original tokenizer, resize embeddings only if you truly add vocab.
4. **Watch forgetting** — eval BOTH the domain task AND a general benchmark before/after; if general drops, raise general-data share or lower LR.
5. **Eval** — domain eval up + general flat is the success signal.

## Verification
- Domain metric improves while a general set does not regress beyond an acceptable bound. Log the mix ratio and LR; reproduce.
