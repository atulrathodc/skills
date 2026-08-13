---
name: ci-cd-troubleshooting
description: Diagnose pipeline failures from the logs, not the final status.
allowed-tools: Read, Grep, Glob, Bash
---

# CI/CD Troubleshooting

- Read the failing step's log output, not just the final red status.
- Compare the failing run against the last green run of the same step.
- Distinguish a broken test from a broken environment or a flaky step.
- Check for environment drift: dependency versions, caches, tooling, secrets.
- Reproduce locally with the same commands the pipeline runs.
- Fix whichever is actually broken — the config or the code.
- Rerun the failing step where the runner supports it, then the full pipeline.
- Do not mask failures with retries or timeouts without a root cause.
