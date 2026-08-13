---
name: caching-strategies
description: Cache the right data at the right layer with correct invalidation.
allowed-tools: Read, Grep, Glob, Bash
---

# Caching Strategies

Before adding a cache:

- Identify the actual bottleneck — do not cache on speculation.
- Pick the layer: in-memory, CDN, HTTP headers, query cache, or persistent store.
- Define the invalidation rule first: TTL, key-based eviction, or write-through.
- Prefer short TTLs over stale correctness — invalidation is harder than caching.
- Never cache per-user secrets or sensitive data in shared stores.
- Bound cache size to avoid unbounded memory growth.
- Add a way to observe hit rate and stale entries.
- Verify the cached value is correct, not just fast.
