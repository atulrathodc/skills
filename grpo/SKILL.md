---
name: grpo
description: Group Relative Policy Optimization: RL with group-normalized rewards, no value network.
allowed-tools: Bash, Read, Write, Edit, Glob, Grep
---
# Grpo

**When:** Verifiable-reward tasks (math/code/reasoning) where you can score outputs.

1. Sample a group of N responses per prompt; score each (verifiable/exact/exec) deterministically.
2. Compute advantages by normalizing rewards within each group; update policy with a KL-to-reference term.
3. Use an SFT/reference policy and keep it frozen; clamp/clip importance ratios for stability.
4. Iterate: sample → reward → normalize → update; log reward, KL, pass-rate.
Verify: pass-rate on held-out verifiable set; response length/format sane; no reward hacking.
