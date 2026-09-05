---
name: llm-evaluation
description: Evaluate an LLM properly for the task (metrics, baselines, clean comparison).
allowed-tools: Bash, Read, Write, Edit, Glob, Grep
---
# Llm Evaluation

**When:** You need to know if training/a change actually helped.

1. Define the metric to match the real task (accuracy, exec-pass, preference win-rate, rubric); avoid a metric that gaming helps.
2. Use a fixed eval harness: same prompts, sampling (seed/temp), few-shot, tokenizer — apples to apples vs baseline.
3. Report pass@1 AND pass@k / self-consistency where relevant; add a regression suite + human spot-check.
4. Watch contamination/leakage so numbers are honest.
Verify: numbers reproducible; improvement is real and not metric-gaming.
