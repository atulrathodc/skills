---
name: tool-selection
description: Select the smallest and most appropriate tool for each operation.
allowed-tools: Bash, Read, Grep, Glob
---

# Tool Selection

Prefer:

- targeted search over full repository scans
- symbol search over reading unrelated files
- focused reads over entire files
- targeted tests over full suites
- deterministic commands over exploratory shell loops

Before using a tool ask:

1. What information do I need?
2. Which tool can obtain it most directly?
3. What is the smallest operation that provides that information?