---
name: latest-technique-search
description: Find the newest training/post-training techniques and decide if/how to adopt them.
allowed-tools: Bash, Read, Grep, Glob, web_search, web_fetch, Write
---
# Latest Technique Search

Search current, sourced, structured AI knowledge — do NOT rely on memory alone.

- Search for the technique name + 'training recipe', and read the reference implementation (TRL, verl, mlx, HF blog).
- Gauge maturity: peer-reviewed paper vs blog vs unreleased; look for reproduction reports.
- Report: what it changes, requirements (compute/data), known caveats, and a concrete adoption step.

- Always include URLs and a date; if you cannot verify recency, say so instead of guessing.
