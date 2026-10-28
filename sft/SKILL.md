───
---
name: sft
description: "Supervised fine-tuning: teach a base model to follow instructions / chat / format."
allowed-tools: Bash, Read, Write, Edit, Glob, Grep
---
# SFT

**When:** Base model doesn't follow instructions or output the expected format.

1. **Data quality over quantity**: a few thousand curated, diverse, deduplicated examples beat tens of thousands of noisy ones. Keep coverage of the task/format you actually serve; 3-10k high-quality samples is a common sweet spot for instruction/chat.
2. **Chat-template faithfulness**: format exactly as inference will use it — same template, same system prompt, same role tokens, same special token IDs. Train and inference must share the template or you silently corrupt the format. Tokenize with correct padding & an attention mask.
3. Compute next-token loss **on completions only — mask the prompt tokens** so the model isn't rewarded (or trained) for predicting the user/instruction text back; this is how you avoid prompt-repetition and overfitting to the input.
4. **Packing**: concatenate multiple examples up to `max_seq_len` (using EOS + attention-mask boundaries) to avoid wasted padding tokens and train faster on sparse data. Ensure mask boundaries don't let loss leak across examples.
5. LR: full FT ~**1e-5..2e-5**; LoRA/PEFT ~**1e-4..3e-4**. Train **1-3 epochs** (rarely more — SFT overfits fast). Watch eval loss: once train loss keeps dropping while eval loss plateaus or rises, you're memorizing — stop and keep the best checkpoint.
6. **Evaluate with generation, not just loss**: run template-faithful prompts through a greedy/decode pass and judge format, instruction-following, and coherence — loss can be low while generations are degenerate or regurgitated. Watch for hallucination/regurgitation and loss of prior capability (catastrophic forgetting).

Verify: format & instruction-following on held-out prompts (real generation scoring, not loss); eval loss plateaus before training loss (no overfit); a capability regression set (math/QA/safety) stays flat.

───