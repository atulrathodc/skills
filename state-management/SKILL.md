---
name: state-management
description: Follow the repo's state pattern and keep updates predictable.
allowed-tools: Read, Grep, Glob
---

# State Management

- Use the repo's existing state library and pattern — do not introduce a new one.
- Keep state updates immutable and predictable (reducers, stores, or hooks as used).
- Derive values rather than storing redundant copies that can drift.
- Treat async updates atomically — handle loading, error, and stale-response races.
- Avoid shared mutable singletons across modules unless that is the convention.
- Reset or rehydrate state correctly on route changes and reconnects.
- Match the surrounding components' update and subscription style.
