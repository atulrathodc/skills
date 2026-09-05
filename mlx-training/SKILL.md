---
name: mlx-training
description: Custom training loops on MLX: optimizers, loss, gradients, batching.
allowed-tools: Bash, Read, Write, Edit, Glob, Grep, web_search, web_fetch
---
# Training — Custom training loops on MLX: optimizers, loss, gradients, batching

- - Use `mx.grad`/`mx.value_and_grad` on a model's loss; `mx.tree_map` to update params with an optimizer (`mlx.optimizers`).
- - Gradient accumulation + `mx.eval` per step keeps memory flat; watch peak memory on Apple silicon.
- - Verify: loss decreases and a small eval improves; log tok/s.
