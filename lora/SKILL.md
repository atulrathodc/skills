───
---
name: lora
description: Parameter-efficient fine-tuning with low-rank adapters; adapt weights cheaply.
allowed-tools: Bash, Read, Write, Edit, Glob, Grep
---
# LoRA

**When:** You need to fine-tune but can't afford full training (memory/compute), or you want many cheap task-specific variants.

1. Mechanism: a frozen weight `W ∈ ℝ^{d×d}` is updated by adding `ΔW = (α/r)·BA` where `B ∈ ℝ^{d×r}`, `A ∈ ℝ^{r×d}`, and `r ≪ d` is the rank. During training only A and B (plus maybe norms) are trainable; W itself never changes.
2. Init: **B = 0, A = random** — so `ΔW = 0` at start and the model behaves exactly like the base, then learns the residual. Scaling is `(α/r)` with `α` a constant (e.g. 8-64, often ~2×r); don't bake alpha into the matrix values — keep it as a scalar multiplier applied at merge/forward.
3. Heuristics: rank r = **8-64** (r=16/32 is a good default; r too large adds memory, slower training, and risks overfitting on small data); `α ≈ 2r`; LR ~**1e-4..3e-4** (adapters need LR ~10-100× higher than full FT). Apply **dropout** (~0.05-0.1) on the adapter weights to regularize, especially with small datasets.
4. Target `target_modules`: the four attention projections q,k,v,o **and** the MLP gate/up/down (`gate_proj, up_proj, down_proj`). Training all of q,k,v,o + MLP generally outperforms q,v-only; start there, ablate if memory is tight. Bias/embeddings usually stay frozen.
5. If a new task is close to an existing one, **init the new adapter from the old one** (warm start) instead of from zero. Multi-adapter: keep each task's A/B separate (few MB each) on the same frozen base and switch at serving time.
6. Merge vs keep-separate: **merge** (`W' = W + (α/r)BA`) before quantized/served inference so only one weight matrix runs and speed/match stays exact; keep separate to swap tasks. **Pitfalls:** r too large (overfits/underperforms), wrong `target_modules` (adaptive projections missed → poor tuning), forgetting to merge before serving → adapters silently unused; don't merge a 4-bit quantized base naively (dequantize to fp16/bf16 first — see qlora).

Verify: task metric improves while base behavior is preserved; training memory ≈ activations + only adapter optimizer states; after merge, eval on the merged weights equals adapter-on-top; adapters transfer across bases only if architecture (dim, modules) matches.

───