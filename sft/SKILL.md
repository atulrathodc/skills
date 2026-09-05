---
name: sft
description: Supervised fine-tuning: teach a base model to follow instructions / chat / format.
allowed-tools: Bash, Read, Write, Edit, Glob, Grep
---
# Sft

**When:** Base model doesn't follow instructions or output the expected format.

1. Use instruction/chat data with the model's chat template; include few high-quality examples, not volume.
2. Format exactly as inference will use (same template, same system prompt); tokenize with padding/attention masks.
3. Train next-token loss on completions only (mask the prompt) to avoid learning prompt-repetition; lr ~1e-5..2e-5.
4. Eval with template-faithful prompts + a quality check (not just loss).
Verify: format & instruction-following on held-out prompts; watch for hallucination/regurgitation.
