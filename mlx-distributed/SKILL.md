---
name: mlx-distributed
description: Scale MLX training across multiple devices/Macs (sharding, collectives).
allowed-tools: Bash, Read, Write, Edit, Glob, Grep, web_search, web_fetch
---
# Distributed — Scale MLX training across multiple devices/Macs (sharding, collectives)

- - mlx.distributed exposes process groups + all_gather etc.; data-parallel is the common starting point.
- - Watch unified-memory and interconnect; log per-device throughput and verify gradient equivalence vs single device.
- - Verify: losses match a single-device run (determinism) at same batch.
