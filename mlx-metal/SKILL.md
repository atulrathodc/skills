---
name: mlx-metal
description: Optimize MLX/Metal GPU usage: device choice, memory, kernel config on Apple Silicon.
allowed-tools: Bash, Read, Write, Edit, Glob, Grep, web_search, web_fetch
---
# Metal — Optimize MLX/Metal GPU usage: device choice, memory, kernel config on Apple Silicon

- - Confirm `mx.metal.is_available()`; set device/stream; big layers run on metal, small overhead on cpu.
- - Profile with Instruments (Metal System Trace); watch GPU utilization and memory stalls.
- - Verify: tok/s and memory improved; numerics still match cpu.
