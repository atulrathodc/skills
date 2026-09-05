---
name: expert-parallelism
description: Expert Parallelism — train infra guidance for AI/LLM development.
allowed-tools: Bash, Read, Write, Edit, Glob, Grep
---

# Expert Parallelism

- Distributed training tooling: choose by scale (PyTorch DDP/FSDP, DeepSpeed, Megatron, Accelerate, MLX).
- Match parallelism to hardware (data/tensor/pipeline/expert) and optimize memory (activation ckpt, offload, bf16).
- Verify: throughput (tok/s) and loss parity vs a single-device baseline.
