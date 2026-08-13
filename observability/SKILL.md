---
name: observability
description: Add logs, metrics, and tracing that answer operational questions.
allowed-tools: Read, Grep, Glob, Edit
---

# Observability

Before adding telemetry:

- Identify the question it must answer (why is this slow? failing? degrading?).
- Prefer structured logs with a stable key set over prose messages.
- Include request or correlation IDs to stitch logs across services.
- Add rate, latency, and error metrics on hot paths.
- Make the "why" greppable — stable log keys beat free text.
- Do not log secrets, tokens, or full request bodies.
- Keep noise low: each log line should justify its existence.
