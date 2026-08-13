---
name: logging
description: Maintain useful, structured, and safe application logging.
allowed-tools: Read, Grep, Glob
---

# Logging

Logs should help answer:

- What happened?
- Where?
- Why?
- What request or operation was involved?
- Can the failure be correlated?

Never log:

- passwords
- tokens
- secrets
- private keys
- sensitive personal information

Avoid noisy logs inside tight loops.