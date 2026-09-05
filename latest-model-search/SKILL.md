---
name: latest-model-search
description: Search the web for the newest released AI/LLM models and identify what is actually novel and useful.
allowed-tools: Bash, Read, Grep, Glob, web_search, web_fetch, Write
---
# Latest Model Search

Search current, sourced, structured AI knowledge — do NOT rely on memory alone.

- Use web_search with fresh, specific terms (model name + provider + release month) and cross-check the official release/card page.
- Prefer primary sources (provider blog, HF model card, arXiv) over aggregators; note the release date (be current — check the present month/year).
- Report: name, developer, params/architecture, context length, license, availability (API/local/mlx), and how it differs from prior SOTA.

- Always include URLs and a date; if you cannot verify recency, say so instead of guessing.
