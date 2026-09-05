---
name: reasoning-models
description: Work effectively with reasoning (thinking) LLMs: long CoT, RLVR-trained models, test-time behavior.
allowed-tools: Bash, Read, Write, Edit, Glob, Grep
---

# Reasoning Models

1. **Know the mode** — reasoning models emit long chain-of-thought before answering; use them for multi-step/math/code/logic, and the non-reasoning mode for simple/format tasks (faster/cheaper).
2. **Prompting** — ask for the reasoning + a clear final answer; set a token/length budget so it doesn't ramble; verify the final line parses.
3. **Reliability** — sample multiple and take majority/self-consistency, or use a verifier for best-of-N; single greedy samples can be confidently wrong.
4. **Training (if you train)** — SFT on verified long-CoT traces, then RLVR/GRPO with verifiable rewards (reasoning-training).
5. **Cost control** — reasoning tokens dominate cost; truncate/limit length and cache where possible.

Verify: answer accuracy and reasoning length/cost both measured.
