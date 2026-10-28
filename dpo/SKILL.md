───
---
name: dpo
description: "Direct preference optimization: align a model from preference pairs without a reward model/RL loop."
allowed-tools: Bash, Read, Write, Edit, Glob, Grep
---
# DPO

**When:** You have chosen/rejected pairs and want better preference alignment without an explicit reward model/PPO loop.

1. **Start from an SFT model** — DPO aligns an already-instruction-following checkpoint; a raw base collapses. This SFT checkpoint becomes the (frozen) reference `π_ref`.
2. **Objective intuition**: DPO re-expresses RLHF's reward as an **implicit reward = the log-ratio** `r(x,y) = β·log π_θ(y|x)/π_ref(y|x)`. Maximizing preference under this reward (no separate reward model) becomes: maximize `log σ( β·[logπ_θ(y_w|x)/π_ref(y_w|x) − logπ_θ(y_l|x)/π_ref(y_l|x)] )`. β is the temperature / KL strength: higher β clamps harder to `π_ref` (less drift, weaker alignment); lower β exploits the pairs more aggressively but risks overfitting/hacking.
3. The gradient pushes up the chosen response's relative probability and down the rejected's, always **held to the reference by the KL term** so it doesn't run away. Keep `π_ref` **frozen** throughout — it is the anchor for both the reward and the KL. Use a small LR (~5e-7..2e-6) and few epochs.
4. **Pair construction** is where quality lives: each pair is (chosen, rejected) for the SAME prompt, chat-template-consistent, usually the SFT model sampling both (on-policy) or harvested from logs (off-policy). Drop **ties** and low-confidence/ambiguous pairs, dedupe, and keep the chosen genuinely preferred (human-judged) over the rejected. On-policy pairs track the current policy better; off-policy is cheaper but drifts.
5. Pitfalls: DPO can overfit to pairs and game them — watch for **IDK / refusal avoidance** (model dodges rather than answers) and **verbosity bias** (model writes longer to look preferred). Reward-hacking appears as win-rate up but generation quality/format down.
6. Evaluate with **win-rate against a reference** (GPT-judge or human on the target task) AND a **regression / general-quality suite** (MMLU-style, format, safety). A good DPO run shows win-rate up while regression quality stays flat.

Verify: preference win-rate up on held-out pairs/prompts; general instruction/quality evals flat (no collapse, no verbosity or IDK drift); the chosen response's implicit reward is consistently above the rejected's; no reward hacking.

───