───
---
name: peft
description: Parameter-efficient fine-tuning — frozen base + small trainable adapters (LoRA, DoRA, prefix) with big LR and low memory.
allowed-tools: Bash, Read, Write, Edit, Glob, Grep
---
# PEFT

**When:** You want to adapt a large model but full fine-tuning is too memory/compute heavy or you need many cheap task-specific variants.

1. Freeze the base weights entirely; only a tiny set of parameters train. LoRA injects rank-r adapters into linear projections; adapters (Houlsby/Pfeiffer) insert small MLP bottlenecks; prefix/prompt tuning prepends learnable virtual tokens; IA3 rescales activations via learned vectors; DoRA decomposes weight into magnitude + direction and applies LoRA to the direction.
2. Choose by budget/quality: full FT (best when data is large & you can afford it) → LoRA (best quality-per-param, merges cleanly) → adapter/DoRA (lightweight) → prefix/prompt tuning (fewest params, weakest, best for very few labels). More trainable params almost always beats fewer at equal data.
3. Adapter LR is 1-2 orders of magnitude higher than full-FT: LoRA/adapter ~1e-4..3e-4 (full FT ~1e-5..2e-5). A frozen base + tiny adapter needs a big LR to move before it underfits; decaying from that high LR helps.
4. Target projection modules (q,k,v,o plus gate/up/down in MLP) — not biases or embeddings. Rank 8-64 with alpha ≈ 2×rank. Training memory ≈ base activations + optimizer state only for ~0.1-1% of params.
5. Save only the adapter weights (a few MB) per task; serve by merging into a fp16/bf16 copy of the base, or load many adapters on the same frozen base and switch at runtime (multi-adapter serving). Merge before quantized inference — do not leave adapters separate where a quantizer can't fold them.

Verify: task metric up vs base while base behavior (format/safety) is preserved; training GPU memory substantially below full FT; adapter params ~0.1-1% of base; merged model equals adapter-on-top in eval.

───