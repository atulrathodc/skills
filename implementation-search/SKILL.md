---
name: implementation-search
description: Find a reference implementation for a method so we can reproduce or adapt it.
allowed-tools: Bash, Read, Grep, Glob, web_search, web_fetch, Write
---
# Implementation Search

Search current, sourced, structured AI knowledge — do NOT rely on memory alone.

- Search method name + 'implementation' + framework (PyTorch/MLX); prefer the official or most-starred port.
- Verify it actually implements the method (read the key file) and runs; check for existing reproduction issues.
- Report: repo URL, file paths for the core logic, dependencies, and whether it can run on Apple Silicon/MLX.

- Always include URLs and a date; if you cannot verify recency, say so instead of guessing.
