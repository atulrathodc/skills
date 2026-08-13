---
name: performance-analysis
description: Identify meaningful performance problems before optimizing code.
allowed-tools: Read, Grep, Glob, Bash
---

# Performance Analysis

Look for:

- unnecessary repeated I/O
- N+1 queries
- excessive allocations
- repeated parsing
- unnecessary network calls
- inefficient loops
- unbounded collections
- excessive logging
- unnecessary serialization

Do not optimize based solely on intuition.

Prefer evidence from profiling, measurements, or clear complexity analysis.