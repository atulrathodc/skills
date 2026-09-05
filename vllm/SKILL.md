---
name: vllm
description: Serve/fine-tune-era LLMs at scale with vLLM — paged attention, continuous batching, OpenAI API.
allowed-tools: Bash, Read, Write, Edit, Glob, Grep
---

# vLLM

1. **Install/run** — `pip install vllm`; start an OpenAI-compatible server: `vllm serve HF/MODEL --tensor-parallel-size N --max-model-len 32768`. Load from HF, safetensors, or a merged model.
2. **Throughput** — vLLM gives paged KV cache + continuous batching; raise throughput via larger batch/`--max-num-seqs`, prefix caching (`--enable-prefix-caching`), and speculative decoding if you have a draft model.
3. **Quantization** — serve quantized (AWQ/GPTQ/FP8) to raise throughput/lower memory: `--quantization awq` with an AWQ model.
4. **Rollouts** — for RL, many use vLLM for high-throughput generation; keep sampling params explicit (temp, top_p, seeds).
5. **Monitor** — tokens/sec, TTFT/ITL, GPU memory; a hung generation is usually a max-len/context mismatch.

Verify: reproducible tok/s and correct outputs vs a reference (logits/generation parity where it matters).
