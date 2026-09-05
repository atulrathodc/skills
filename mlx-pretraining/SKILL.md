---
name: mlx-pretraining
description: Pretrain a small/medium model from scratch on Apple Silicon with MLX — data, tokenizer, training loop, eval.
allowed-tools: Bash, Read, Write, Edit, Glob, Grep
---

# MLX Pretraining (from scratch)

On Apple Silicon, "from scratch" means a SMALL model (unified memory is your ceiling, e.g. ≤ ~7–30B params only with quantization/tricks; realistically <~3B for real pretraining). Plan around that.

1. **Scope small** — pick N/D that fits RAM+activations; use `mlx-pretraining`/`mlx` examples as a starting config, and scale-law-plan to justify N/D.
2. **Data** — tokenize your corpus to shards offline (see tokenizer-training, dataset-engineering); streaming JSON/parquet into the mlx data pipeline.
3. **Tokenizer** — train a BPE/Unigram on your mix with HF `tokenizers`; reuse it at train and eval.
4. **Model + loop** — implement or reuse an mlx `nn.Module` (Llama-style) with your config; write a training loop with `mx.value_and_grad`, an optimizer (AdamW), cosine schedule, gradient accumulation + `mx.eval` per step to bound memory.
5. **Mixed precision / memory** — bf16 where supported, activation checkpointing, gradient accumulation to raise effective batch without OOM; watch Metal peak memory.
6. **Eval during training** — log val loss + small probes; save checkpoints to disk frequently.

## Verification
- Loss decreases reproducibly; tok/s recorded; memory stays within the machine; a small eval suite improves. Keep a config + seed log for reproducibility.
