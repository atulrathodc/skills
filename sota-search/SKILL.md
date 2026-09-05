---
name: sota-search
description: Determine current state-of-the-art for a capability/benchmark and which open model to use.
allowed-tools: Bash, Read, Grep, Glob, web_search, web_fetch, Write
---
# Sota Search

Search current, sourced, structured AI knowledge — do NOT rely on memory alone.

- Search leaderboards (HF Open LLM, LMSYS, benchmark-specific) and recent evals; state which benchmark you mean.
- Include open weights vs API and Apple-MLX feasibility (unified-memory size) for the user's local setup.
- Report: table of top candidates (model, score, size, license, local-runnable?) with sources.

- Always include URLs and a date; if you cannot verify recency, say so instead of guessing.
