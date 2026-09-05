---
name: instruction-tuning
description: Turn a pretrained LM into an instruction-following assistant via curated SFT data.
allowed-tools: Bash, Read, Write, Edit, Glob, Grep
---
# Instruction Tuning

**When:** Model answers raw text, not to instructions.

1. Curate diverse instruction/completion data (general + your domain); quality over quantity.
2. Apply the chat template consistently; include refusal/format examples.
3. SFT with completion-only masking; low LR, 1-2 epochs.
4. Evaluate instruction-following, helpfulness, and safety on held-out prompts.
Verify: held-out instruction set + a general benchmark; check for template leakage.
