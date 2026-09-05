---
name: mlx
description: Apple's MLX array framework — build/train/run models on Apple Silicon unified memory (NumPy-like Python API).
allowed-tools: Bash, Read, Write, Edit, Glob, Grep, web_search, web_fetch
---
# MLX essentials — Apple's MLX array framework — build/train/run models on Apple Silicon unified memory (NumPy-like Python API)

- - `pip install mlx`; ops are lazy+NumPy-like; arrays live in unified memory shared by CPU/GPU (no copies).
- - Two devices: cpu/metal; `mx.eval` materializes lazy graphs; use `mx.metal.device_info()` to check GPU.
- - Verify a tiny forward pass + gradient works before scaling; profile peak memory.
