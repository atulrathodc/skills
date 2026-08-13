---
name: architecture-discovery
description: Understand repository architecture before making cross-cutting changes.
allowed-tools: Read, Grep, Glob, Bash
---

# Architecture Discovery

- Identify application entry points.
- Identify major modules and boundaries.
- Identify dependency direction.
- Identify configuration and environment loading.
- Identify persistence, APIs, messaging, and external integrations.
- Identify shared utilities and infrastructure.
- Identify tests associated with each major component.
- Trace the execution path relevant to the requested change.
- Prefer existing architecture over introducing new patterns.
- Document important architectural constraints before implementation.