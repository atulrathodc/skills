---
name: verification
description: Verify implementation changes before declaring a coding task complete.
allowed-tools: Bash, Read, Grep, Glob
---

# Verification

Before reporting completion:

- Inspect the final diff.
- Verify all requested behavior.
- Run targeted tests.
- Run type checking or compilation when applicable.
- Check for lint/build failures when relevant.
- Confirm no unintended files changed.
- Confirm no debugging code or temporary files remain.
- Report exactly what was verified.

Never claim "fixed" solely because the code was edited.