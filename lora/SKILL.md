---
name: lora
description: Parameter-efficient fine-tuning with low-rank adapters; adapt weights cheaply.
allowed-tools: Bash, Read, Write, Edit, Glob, Grep
---
# Lora

**When:** You need to fine-tune but can't afford full training (memory/compute).

1. Freeze base weights; add rank-r adapters to attention/MLP projections (default: q,v or all linear).
2. Only adapter params + small epsilon train; keep base in low precision / quantized.
3. Choose rank (8-64) & alpha (≈2×rank); lr ~1e-4..3e-4 (adapter LR is higher than full FT).
4. Merge adapters into the base before serving (or serve with adapter on top).
Verify: task metric improves while base behavior is preserved; adapters transfer across similar bases only if architecture matches.
