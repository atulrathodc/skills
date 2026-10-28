───
---
name: qlora
description: "QLoRA-style: quantize the base to 4-bit and train LoRA on top — big models on small memory."
allowed-tools: Bash, Read, Write, Edit, Glob, Grep
---
# QLoRA

**When:** The model is too big to fine-tune even with LoRA on full fp16/bf16; you want a 70B-class model trainable on a single consumer GPU.

1. Mechanism: keep the base frozen and in **4-bit** — `nf4` (normalFloat4, an information-theoretically optimal 4-bit layout that clusters values by their normal distribution) plus **double quantization** (quantize the 4-bit quantization constants themselves to 8-bit, saving a few hundred MB without losing precision). LoRA adapters train on top precisely because a quantized base is hard to update, but the adapter residual correction recovers most of the lost precision.
2. Compute in **bf16**: the 4-bit base is dequantized on-the-fly to bf16 for the forward/backward, while the frozen 4-bit weights stay packed. Gradient checkpoints the activations (recompute in backward) to avoid storing huge activations. Use **paged optimizers** (e.g. paged AdamW) that store optimizer states and evict on the CPU to avoid OOM.
3. Why it works — memory math intuition: optimizer state (Adam) is 12 bytes/param and activation memory dominates at scale; freezing + 4-bit base removes base optimizer + cuts base weights by ~8× vs fp16 (4 bits vs 16), so you fit a model ~3-4× more parameters than LoRA-on-fp16 for the same VRAM. Trainable LoRA params are only 0.1-1% of the base.
4. Rules: quantize the WHOLE base, keep LoRA on the (dequantized) target projections — never let a quantized layer take the LoRA gradient path. Use rank 16-64, α≈2r, LR ~1e-4..2e-4, 1-3 epochs, small batch to fit memory. Evaluate on a few held-out tasks to confirm quality is near the fp16 baseline.
5. Known instabilities / caveats: quantization + low-precision accumulate can cause loss spikes (watch NaN/Inf; use gradient clipping); some layers (embeddings, LM head) fight quantization — keep them in higher precision or retarget adapters to MLP; and **merging** — you cannot staple LoRA weights into packed 4-bit values. Dequantize the base to fp16/bf16, add the (α/r)BA residual, THEN re-quantize — or serve the 4-bit base with the adapter on top.

Verify: eval within a small margin of the LoRA-on-fp16 baseline; peak VRAM fits your GPU; no NaN/Inf over the run; serving after merge (dequantize → add residual → requantize) reproduces the trained adapter's outputs.

───