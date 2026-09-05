---
name: mlx-profiling
description: Profile MLX training/inference: throughput, memory, GPU usage, bottleneck.
allowed-tools: Bash, Read, Write, Edit, Glob, Grep, web_search, web_fetch
---
# Profiling — Profile MLX training/inference: throughput, memory, GPU usage, bottleneck

- - Measure tok/s and peak memory at scale; use `mx.metal` metrics + Instruments.
- - Isolate bottleneck (kernel, memory bandwidth, graph eval) before optimizing.
- - Verify: reproducible before/after numbers logged.
