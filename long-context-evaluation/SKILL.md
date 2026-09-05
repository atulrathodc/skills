---
name: long-context-evaluation
description: Long-Context Evaluation — eval guidance for AI/LLM development.
allowed-tools: Bash, Read, Write, Edit, Glob, Grep
---

# Long Context Evaluation

- Evaluations are only as good as their match to the task + clean comparison (same prompt/sampling/metrics).
- Report pass@k / majority / self-consistency where relevant; run ablations.
- Verify: numbers reproducible; note what the benchmark does NOT measure.
