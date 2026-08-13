---
name: environment-setup
description: Reproduce, verify, and document the local development environment.
allowed-tools: Read, Grep, Glob, Bash
---

# Environment Setup

- Check the repo for setup instructions (README, Makefile, scripts, package.json).
- Use the documented commands rather than guessing new ones.
- Verify setup by running the documented smoke step (tests, build, dev server).
- When the documented setup is wrong or missing, fix it and record the correct steps.
- Note exact runtime and tool versions when the setup is version-sensitive.
- Do not invent setup paths that differ from what the repo expects.
