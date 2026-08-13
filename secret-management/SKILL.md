---
name: secret-management
description: Keep credentials, tokens, and keys out of code, config, and logs.
allowed-tools: Read, Grep, Glob
---

# Secret Management

- Never hardcode credentials in source, config, or tests.
- Load secrets from the environment or a secrets manager at runtime.
- If a secret you touched was already committed, flag rotation.
- Grep for obvious secrets (`sk-`, `AKIA`, private key blocks) before finishing.
- Do not log request bodies, headers, or config dumps that may contain secrets.
- Prefer placeholders and documented env var names over real values.
