---
name: synthetic-data
description: Generate synthetic training data (from a teacher/LLM) to augment or bootstrap a dataset.
allowed-tools: Bash, Read, Write, Edit, Glob, Grep
---
# Synthetic Data

**When:** Not enough real data, or you want to add coverage/edge cases.

1. Seed from real examples; generate with a capable teacher using templates/prompts and your schema.
2. Validate: filter by verifiable checks where possible; sample-review quality; watch for repetition/echo.
3. Balance real vs synthetic; keep ratios modest to avoid degrading style.
4. Tag provenance so you can ablate real vs synthetic later.
Verify: model trained on mix beats base on the target eval without style/robustness regressions.
