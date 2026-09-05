---
name: llama-cpp
description: Run GGUF LLMs locally (incl. Apple Silicon) with llama.cpp — quantized, no heavy deps.
allowed-tools: Bash, Read, Write, Edit, Glob, Grep
---

# llama.cpp

1. **Purpose** — run GGUF-quantized models on CPU/GPU with tiny footprint (great for Mac/Apple Silicon and edge).
2. **Convert** — from HF: `llama.cpp/convert_hf_to_gguf.py model/ -o model.gguf`, then `llama-quantize model.gguf Q4_K_M`. (mlx_lm.convert can also produce GGUF.)
3. **Run/serve** — `llama-server -m model.gguf --port 8080` gives an OpenAI-compatible API; CLI `llama-cli` for single prompts.
4. **Tune** — context (`-c`/`--ctx-size`), `--threads`, GPU layers (`-ngl 99` on Metal/CUDA), and temperature/top_p.
5. **Compare with MLX** — on Apple Silicon compare llama.cpp vs mlx for your model: both are valid; pick by tok/s/memory/convenience (mlx integrates with mlx-lm training/adapters).

Verify: reproducible generation, sane tok/s, and that output matches expectations for the quant level.
