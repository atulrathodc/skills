---
name: continuous-batching
description: Continuous Batching — inference guidance for AI/LLM development.
allowed-tools: Bash, Read, Write, Edit, Glob, Grep
---

# Continuous Batching

- Inference engines: vLLM/SGLang/TensorRT-LLM/llama.cpp for serving; MLX/local for Apple.
- Optimize via KV/prefix cache, continuous batching, speculative decoding, quantization.
- Verify: latency/throughput + memory on the real workload.
