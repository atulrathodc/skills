---
name: dpo
description: Direct preference optimization: align a model from preference pairs without a reward model/RL loop.
allowed-tools: Bash, Read, Write, Edit, Glob, Grep
---
# Dpo

**When:** You have chosen/rejected pairs and want better preference alignment.

1. Start from an SFT model (reference); collect preference pairs (chosen vs rejected) with the same prompt.
2. DPO updates with a KL-to-reference term; beta controls how hard it exploits the pairs.
3. Keep the reference model frozen; use chat-template-consistent pairs; filter ties/low-confidence.
4. Evaluate preference win-rate AND general quality (DPO can overfit pairs).
Verify: win-rate up, general/instruction quality flat, no reward hack.
