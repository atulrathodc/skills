---
name: optimization-techniques
description: The complete technique map for making ML/LLM work faster and cheaper — enumerate and choose among every optimization axis (algorithmic, precision, memory, attention, batching, caching, compilation, parallelism, model-level, data-level), with how to measure each.
allowed-tools: Bash, Read, Write, Edit, Glob, Grep
---

# Optimization Techniques

Optimization is measurement-driven before it is technique-driven. There are dozens of levers, but they only help where time or memory actually goes — and the #1 mistake is applying a shiny kernel (say, fp8) to a workflow whose true bottleneck is the dataloader, the cold start, or the decode. This is the **umbrella/reference skill**: it maps the full space of ML/LLM optimization techniques and routes each one to the narrower dedicated skill that owns the depth. Use it as a survey + decision table; do not re-implement the detail that lives in the leaf skills.

1. **Profile before you pick** — establish the rule: run a profiler (`torch.profiler`, `nsys`, `ncu`, MLX's built-in profiler / `mx.compile` traces) and write down where time and memory actually go — **prefill vs decode** for LLMs, **matmul vs attention vs sampler vs VAE-decode vs dataloader** for diffusion, **data loading vs forward vs backward** for training. If the dataloader is 80% of wall-clock, no kernel swap helps; fix the dataloader. If decode is 60% of a video gen, step/CFG tuning is the wrong battle.
2. **Know which axis you're fighting** — decide **memory-bandwidth-bound vs compute-bound** first (the roofline question): a memory-bound op (matmul on small/quantized weights, decoding token-by-token, fp32→bf16 copy) is helped by reducing bytes moved (quantization, fused kernels, KV-cache compression), while a compute-bound op (big GEMM, attention over long sequences) is helped by fewer FLOPs (sparsity, lower precision, faster kernels). Picking an optimization that targets the wrong bound yields "no speedup".
3. **Walk the taxonomy and pick the owner skill** — every technique below has a home in this library; route to it rather than duplicating its depth:
   - **Precision** — fp32→bf16/fp16 (`transformers`, `llm-inference`), fp8 (`fp8`), int8/int4 (`int8`, `int4`), AWQ/GPTQ (`awq`, `gptq`), KV-cache quantization (`kv-cache`), mixed precision, stochastic rounding, OCP Micro-Scaling/MXFP.
   - **Memory** — activation checkpointing / gradient accumulation, ZeRO-style sharding (`deepspeed`, `fsdp`), CPU/NVMe offload, paged KV cache (`vllm`), FlashAttention memory savings (`efficient-attention`, `attention`), fused optimizers / Adam 8-bit.
   - **Attention/compute** — FlashAttention, paged attention, sparse / sliding-window / linear attention, GQA/MQA/MLA, fused & Triton kernels (`efficient-attention`), `torch.compile`, CUDA graphs.
   - **Inference-time decoding** — KV / prefix caching (`prefix-caching`, `kv-cache`), continuous batching (`continuous-batching`), speculative decoding (draft models, Eagle/Medusa, n-gram), parallel/beam-search pruning, adaptive sampling, early exit, MoE expert-routing savings (`moe`).
   - **Serving/system** — tensor / pipeline / expert parallelism, disaggregated prefill/decode, quantized weight streaming, request scheduling, `max-num-seqs` tuning, tailored servers (`vllm`, `sglang`, `tensorrt-llm`, `llama-cpp`), and distillation to a smaller model (`model-distillation`-style compression).
   - **Training** — FSDP/DeepSpeed/Megatron (`fsdp`, `deepspeed`, `megatron`), tensor+sequence+context parallelism, gradient accumulation, **LoRA/QLoRA adapters instead of full fine-tuning** (`lora`, `qlora`), sequence packing, tokenized-dataset caching, dataloader prefetch/workers, fused/CUDA-graph steps, curriculum + early stopping for compute savings.
   - **Model-level compression** — pruning (unstructured/structured/Wanda/SparseGPT, `pruning`), MoE sparsification, layer dropping / distillation, quantization-aware training, weight sharing.
   - **Data/algorithmic** — dedup/filtering to shrink data (`dataset-curation`, `data-filtering`), data-mixture optimization (`data-mixture-optimization`), better tokenizer/packing, longer-but-cheaper context via input compression, kNN/prompt caching instead of new compute.
   - **Hardware-specific** — Apple silicon: MLX/ANE/unified memory and **never trading bandwidth for compute** (`mlx`, `mlx-metal`, `mlx-kernels`, `apple-silicon-optimization`); CUDA: TF32, cuDNN/cuBLAS heuristics, streams (`gpu-optimization`); ROCm/TPU notes.
   - **Workflow-level** — caching results, incremental/delta computation, memoization of repeated calls, batched offline jobs, avoiding recompute in eval loops.
4. **Use the decision table — bottleneck → first technique → skill** — when you know the bottleneck, start here:

   | Bottleneck | First technique to try | Skill to read |
   |---|---|---|
   | Decode-bound (LLM), VRAM has headroom | larger batch / continuous batching | `continuous-batching`, `vllm` |
   | Prefill-bound (long prompts) | paged/fused attention, FlashAttention | `efficient-attention`, `attention` |
   | KV-cache memory growing | KV quantization / paged KV | `kv-cache`, `vllm` |
   | Repeated same-prefix queries | prefix/KV caching | `prefix-caching`, `kv-cache` |
   | Memory-bound, small weights | fp8/int8/int4 quantization | `fp8`, `int8`, `int4`, `quantization` |
   | Compute-bound big GEMM | lower precision + faster kernel | `fp8`, `gpu-optimization` |
   | Full fine-tune too expensive | LoRA / QLoRA adapters | `lora`, `qlora` |
   | Single GPU runs out of memory | offload → sharding (FSDP/ZeRO) | `fsdp`, `deepspeed` |
   | Dataloader is the bottleneck | prefetch/workers, caching, packing | `accelerate`, `dataset-curation` |
   | Latency-bound single requests | speculative decoding | `llm-inference`, `vllm` |
   | Weights too big to fit / load slow | quantized weight streaming, offload | `quantization`, `tensorrt-llm` |

5. **Follow the cheapest-first playbook** — attacks cost engineering effort and risk quality in a near-fixed order. Climb the ladder one rung at a time, re-measuring after each:
   **measure → remove waste → precision → kernels → batching/caching → parallelism → distillation.** Remove waste first (unneeded recompute, stray fp32 tensors, cold-start loads, dead eval recomputation) — it's nearly free and often the biggest win; then lower precision; then contract faster kernels; then batch/cache; then scale out; only last consider distillation/compression, which is the most invasive and quality-risky.
6. **Respect the quality guardrails** — every optimization is a trade, but they sit on a spectrum: **near-lossless** (FlashAttention, `torch.compile`, bf16, fused kernels) vs **lossy** (int4, aggressive pruning, aggressive distillation, quantum-aware-trained compression). Before shipping any change, verify on a **fixed eval set**: perplexity / task metric for LLMs, CLIP-similarity or side-by-side for diffusion/video, output-diff for deterministic code. **Never ship a speed-up with a silent quality regression** — if you cannot demonstrate unchanged quality, it is not done.
7. **Practice disciplined measurement** — benchmark with a **warmup** run excluded (compile/cache warmup is not steady state), **fixed seeds**, and **repeated runs** to absorb variance — report mean and range, not a single sample. Separate **throughput** (e.g. tokens/s, clips/min) from **latency** (per-request p50/p99) from **cost** (per-output), because an optimization can trade one for the other. Use the right profiler for the stack (`torch.profiler` / `nsys` for CUDA, MLX's profiler / `mx.compile` traces for Apple silicon, `ncu` for kernel-level), and record seeds + versions so a result is reproducible.
8. **Verify with a before/after table** — take one real workload, capture a baseline (latency, throughput, peak memory, quality metric) with fixed seeds and warmup excluded, apply **one** technique, re-measure identically, and confirm both the speed-up *and* unchanged quality. Report the table (technique | before | after | delta | quality-delta). That single disciplined loop is the whole discipline of optimization — everything else is technique selection from §3–§4.

## Common failures
- **"No speedup from quantization"** → the workload was memory-bandwidth-bound in a layer quantization didn't touch (e.g. the dataloader or decode), or the fast quantized path never engaged. Profile to confirm where time goes, then quantize the right layer / fix the real bottleneck.
- **"fp8 made it slower"** → unfused scale application or a dtype the kernel doesn't support added dequant traffic. Use the kernel-fused path and re-profile.
- **"`torch.compile` is slower"** → dynamo recompiles on varying shapes, or warmup was counted in the latency. Bucket shapes and exclude warmup.
- **"Multi-GPU is slower than single GPU"** → communication dominates at small batch / small models; the sharding only pays off past a model/batch size where compute ≫ all-reduce.
- **"Speculative decoding is slower"** → low acceptance rate from a draft model that doesn't match the target's distribution; the rejected-draft overhead outweighs the accepted tokens. Measure acceptance rate; tune or drop the draft.
- **"Bigger batch didn't speed it up"** → already at power/i/O limits or the latency makespan is dominated by queueing; measure throughput vs p99 latency separately.

## Verify
- Choose one real workload (an LLM decode path or a diffusion/video generation). Record a baseline with fixed seeds and warmup excluded: latency, throughput, peak memory, and a quality metric (perplexity/task metric, or pixel std / CLIP similarity).
- Apply ONE technique from §3–§4, re-measure identically, and confirm the speed-up is real *and* quality is unchanged (or the quality delta is explicitly accepted).
- Produce the before/after table (technique | before | after | delta | quality-delta) and state which optimization axis you're on (compute- vs memory-bound) so the choice is justified.
- Confirm no silent fallback (kernel/quantization path actually engaged) and no silent NaN → black/garbage output.

Note: this survey complements the leaner `inference-optimization` checklist — use this one when you need the complete technique map and decision routing, and that one for a quick LLM-inference shortcut.

## Related skills
- `quantization` / `fp8` / `int8` / `int4` / `awq` / `gptq` — weight-precision optimization depth.
- `lora` / `qlora` — adapter-based training to avoid full fine-tune cost.
- `pruning` — sparse/structured compression (Wanda, SparseGPT).
- `kv-cache` / `prefix-caching` / `continuous-batching` — the decoding, caching and serving-scale wins.
- `efficient-attention` / `attention` — FlashAttention, sparse/linear attention, GQA/MQA/MLA.
- `gpu-optimization` / `apple-silicon-optimization` / `mlx` / `mlx-kernels` / `mlx-metal` — hardware-specific kernels and roofline intuition.
- `inference-optimization` — the lean LLM-inference checklist (see closing note).
- `llm-inference` / `vllm` / `sglang` / `tensorrt-llm` / `llama-cpp` — serving engines and their tuning knobs.
- `fsdp` / `deepspeed` / `megatron` / `accelerate` — distributed training, sharding, ZeRO, offload.
- `moe` / `sparse-models` / `model-merging` — model-level structural wins.
- `benchmarking` / `experiment-tracking` / `hyperparameter-optimization` — measurement discipline and regression tracking.
- `video-generation-optimization` / `ltx-video` — the same map, specialized to video diffusion.
- `runtime-verification` / `verification` — prove the optimized app actually runs and behaves at runtime.
