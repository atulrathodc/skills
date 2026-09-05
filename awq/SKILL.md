---
name: awq
description: AWQ: activation-aware weight quantization — protects salient channels for better low-bit quality.
allowed-tools: Bash, Read, Write, Edit, Glob, Grep
---

# AWQ

1. **Concept** — weight-only quantization that scales by ACTIVATION magnitude so important weight channels stay accurate at 4-bit; often beats plain GPTQ on quality.
2. **Run** — `pip install awq` (AutoAWQ); quantize a HF model with a calibration set (`--quant_method awq --bits 4 --group_size 128`).
3. **Consume** — vLLM `--quantization awq`, Transformers/AWQ loaders, or convert to GGUF/MLX. Keep bits/group consistent.
4. **Tradeoffs** — AWQ needs calibration data and slightly more compute at load; delivers good 4-bit quality for serving.
5. **Verify** — eval parity on your task and correct outputs via the target runtime.

Report: bits/group, size, eval delta, generation sanity.
