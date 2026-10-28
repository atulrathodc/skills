───
---
name: grpo
description: "Group Relative Policy Optimization: RL with group-normalized rewards, no value network."
allowed-tools: Bash, Read, Write, Edit, Glob, Grep
---
# GRPO

**When:** Verifiable-reward tasks (math, code, reasoning) where you can deterministically score whole outputs (exact match, unit tests, executor) — i.e. RL with verifiable rewards (RLVR).

1. **Mechanics**: for each prompt, sample a **group of G responses** from the current policy (G ~8-64 — old OpenAI/DeepSeek runs use 8-64). Score all G deterministically (correct/incorrect, or a numeric reward).
2. **Advantage = group-normalized, no critic**: compute `advantage_i = (r_i − mean_r) / std_r` **within each group**. This replaces the value/critic network of PPO, since the group mean/std estimates the expected reward — which is why GRPO **halves memory vs PPO** (no critic params, no value-model forward/backward).
3. Loss = PPO-style **clipped ratio** on the advantage, plus a **KL-to-reference penalty** (to a frozen SFT/ref policy, small β, and keep the ratio clipped to [1−ε, 1+ε]) so updates stay on-policy-ish and don't diverge. Update the policy, re-sample, iterate.
4. **Metrics**: log reward, KL, and pass@k / **pass-rate** (`fraction of prompts with ≥1 correct response` in the group) rather than just mean reward — pass-rate tells you coverage, mean reward tells you quality. Sample new answers or reuse the group for pass@k.
5. **Pitfalls**: (a) **zero-variance groups ⇒ zero advantage** — if all G responses get the same reward, the group std is 0 and every advantage is 0/0 → no signal; add small ε or re-sample balanced groups. (b) **Reward hacking** — the model finds shortcuts to the reward (format/gaming instead of real reasoning); use robust, execution-based rewards. (c) **Length inflation** — model writes longer to look better; cap or length-normalize reward. (d) **G too large** wastes compute sampling redundant responses; **G too small** gives noisy advantage estimates. Raise G for hard prompts.
6. GRPO suits exact verifiable rewards (math/code) over PPO (which needs a learned reward model, e.g. for subjective preference). Keep the SFT/reference policy frozen and start from a decent SFT or the alignment job is unstable.

Verify: pass-rate + reward up on a held-out verifiable set; response length/format stays sane; KL stays bounded (no divergence); zero-variance groups don't stall updates.

───