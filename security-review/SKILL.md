---
name: security-review
description: Check code changes for common security vulnerabilities.
allowed-tools: Read, Grep, Glob, Bash
---

# Security Review

Check for:

- authentication bypass
- authorization errors
- injection
- unsafe deserialization
- secrets exposure
- insecure file access
- SSRF
- XSS
- CSRF
- path traversal
- sensitive data leakage
- unsafe command execution

Never print or commit credentials, tokens, private keys, or secrets.