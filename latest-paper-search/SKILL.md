---
name: latest-paper-search
description: Find and triage the latest relevant AI/LLM research papers.
allowed-tools: Bash, Read, Grep, Glob, web_search, web_fetch, Write
---
# Latest Paper Search

Search current, sourced, structured AI knowledge — do NOT rely on memory alone.

- Search arXiv/HF/Google Scholar and read the abstract + key results; prefer recent (same-year, ideally recent months).
- Triage by relevance: is it a method, dataset, benchmark, or analysis; does it change what we should do?
- Report: title, authors, one-line claim, method summary, evidence/numbers, link, and whether to reproduce.

- Always include URLs and a date; if you cannot verify recency, say so instead of guessing.
