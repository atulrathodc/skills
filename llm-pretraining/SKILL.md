---
name: llm-pretraining
description: Pretrain a language model FROM SCRATCH — data mix, tokenizer, architecture, distributed training, loss/eval. For building your own base model, not fine-tuning.
allowed-tools: Bash, Read, Write, Edit, Glob, Grep, web_search, web_fetch
---

# LLM Pretraining (from scratch)

You are building a NEW base model. This is a big, disciplined pipeline — scope it with a scaling-law/compute budget BEFORE writing model code.

## 1. Scope first (compute-driven)
- Use scaling laws: pick (model size N, tokens D) from your compute; ~D ≈ 20 × N is a Chinchilla-style starting point — tune to your data/compute.
- Choose hardware: single GPU/MLX (<~1B) vs multi-GPU (FSDP/DeepSpeed/Megatron) vs multi-node. Hardware decides every later choice.
- Write a one-page plan: N, D, vocab, data source, infra, eval checks, expected wall-time.

## 2. Data — highest leverage
- Curate a large clean corpus (web + code + books + your domain): filter, dedupe (MinHash / embedding near-dup), strip boilerplate/contamination.
- Balance the data MIX and measure mixture effects on a tiny probe before the full run.
- Use a streaming dataloader that never starves the GPUs: shard files, pre-tokenize or tokenize on the fly, reshuffle deterministically by seed.

## 3. Tokenizer
- Train a BPE/Unigram tokenizer on a representative sample of YOUR final mix with the vocab your budget chose (≈32k–256k).
- Verify: high tokens/sec, low redundancy on your domain, clean special tokens.

## 4. Architecture
- Start from a standard, tested config (Llama-style: RoPE, RMSNorm, SwiGLU, GQA; or small MoE for FLOPs-efficiency).
- Match layers/d_model/heads/context to your compute; log FLOPs and expected tok/s; sanity-check with an isoFLOP estimate.

## 5. Training run
- Use an established framework (transformers + FSDP/DeepSpeed/Megatron, or mlx on Apple) — don't hand-roll distributed state.
- Recipe: bf16/mixed precision, AdamW, cosine with ~1% warmup, peak LR by size (roughly 3e-4 down to 1e-4), weight decay, grad clip, gradient accumulation, activation checkpointing.
- Checkpoint frequently + stream; log loss, tok/s, GPU util, memory; keep it reproducible (seed, config, data hash).

## 6. Eval during training
- Track val loss + a small suite (perplexity, few-shot accuracy, code/math/domain probes).
- Watch for loss spikes / divergence (lower LR or clip); keep your probe set free of contamination.

## 7. Iterate
- Run a SMALL spike (tiny model, hours) end-to-end first to validate data/tokenizer/infra/tooling.
- Use the spike to fit your scaling-law constants, then lock the budget and launch the full run.

## Verification
- Reproducible: same config/data/seed ⇒ same loss curve. Evidence: val loss decreasing, tok/s on target, eval suite improving, clear record of N/D/compute used. Be honest about what the spike vs full run tells you.
