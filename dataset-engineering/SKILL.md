---
name: dataset-engineering
description: Build a clean, high-quality training dataset (filter, dedupe, balance, format).
allowed-tools: Bash, Read, Write, Edit, Glob, Grep
---
# Dataset Engineering

**When:** Your model underperforms or you suspect data quality; you need a dataset for training/finetuning.

1. Source + inspect: collect raw data, sample widely, look for duplicates, boilerplate, broken text.
2. Clean: dedupe (MinHash/embedding near-dup), filter low-quality/offensive/contaminated, balance domains/labels.
3. Format to the task (instruction/completion, chat, pairs) matching the tokenizer/template.
4. Version the dataset + record provenance and stats; split train/val/test cleanly.
Verify: small probe trains on the set and improves; quality metrics (dup%, contamination) documented.
