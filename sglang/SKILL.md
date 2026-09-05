---
name: sglang
description: Serve LLMs with SGLang for fast structured/JSON/constrained decoding and high throughput.
allowed-tools: Bash, Read, Write, Edit, Glob, Grep
---

# SGLang

1. **Install/run** — `pip install sglang`; `python -m sglang.launch_server --model-path HF/MODEL`. Use the OpenAI API or SGLang's structured-generation frontend.
2. **Strengths** — very fast structured/constrained decoding (JSON/grammar) and radix-cache-aware scheduling; good for agentic/function-calling workloads that need schema-valid output.
3. **Throughput** — enable radix/prefix caching; batch concurrent requests; choose `--mem-fraction-static` for your GPU memory.
4. **When to prefer** — SGLang shines when you need guaranteed-valid JSON/tools at high volume; vLLM is the broader default.
5. **Monitor** — TTFT/ITL, tok/s, and JSON-validity rate on your schema.

Verify: correct + schema-valid outputs and reproducible throughput.
