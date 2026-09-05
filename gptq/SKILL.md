---
name: gptq
description: GPTQ: post-training 3/4-bit weight quantization with calibration — lower memory at modest quality loss.
allowed-tools: Bash, Read, Write, Edit, Glob, Grep
---

# GPTQ

1. **Concept** — post-training quantization that minimizes per-layer weight error on a small CALIBRATION set; typically 4-bit, groupwise (e.g. g128).
2. **Run** — `pip install auto-gptq` or `gptqmodel`; quantize a HF model on a calibration corpus representative of your task (avoid leaking eval data).
3. **Consume** — load with vLLM/Transformers using `--quantization gptq`; or convert the result to GGUF/MLX when targeting those runtimes.
4. **Tradeoffs** — GPTQ gives larger compression than simple RTN; risk is calibration overfit and outliers. Test on your actual eval, not just perplexity.
5. **Verify** — eval parity within your tolerance and correct inference via the target server.

Report: bits/group, size, eval delta, generation sanity.
