---
name: github-research
description: Research GitHub repos: find implementations, check activity/health, and locate the right code.
allowed-tools: Bash, Read, Grep, Glob, web_search, web_fetch, Write
---
# Github Research

Search current, sourced, structured AI knowledge — do NOT rely on memory alone.

- Search GitHub (via web_search then repo pages or the `gh` CLI when in a repo context) for the exact project.
- Assess health: stars, last commit, issues, tests, license, and whether it supports the needed framework (PyTorch/MLX).
- Report: repo URL, language/framework, install steps, key entry points (train/eval scripts), activity status.

- Always include URLs and a date; if you cannot verify recency, say so instead of guessing.
