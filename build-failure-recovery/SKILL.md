---
name: build-failure-recovery
description: Diagnose compilation, bundling, and build failures systematically.
allowed-tools: Bash, Read, Grep
---

# Build Failure Recovery

When the build fails:

1. Capture the first meaningful error.
2. Ignore downstream cascade errors initially.
3. Locate the originating source.
4. Inspect recent changes.
5. Check dependency and toolchain compatibility.
6. Fix the root cause.
7. Re-run the smallest relevant build.
8. Run the complete build when appropriate.