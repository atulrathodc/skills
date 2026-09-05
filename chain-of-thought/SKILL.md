---
name: chain-of-thought
description: Use/train chain-of-thought reasoning for multi-step problems.
allowed-tools: Bash, Read, Write, Edit, Glob, Grep
---
# Chain Of Thought

**When:** Problems needing intermediate steps; direct answers are wrong.

1. Inference: prompt for step-by-step reasoning; for reliability sample many and take majority (self-consistency).
2. Training: SFT on verified reasoning traces, then RLVR on verifiable tasks to sharpen CoT.
3. Budget reasoning length; strip/verify the final answer line.
4. Eval answer accuracy and reasoning soundness (parse final answer).
Verify: accuracy up with CoT vs direct; check hallucinated intermediate steps.
