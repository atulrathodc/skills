---
name: test-failure-analysis
description: Diagnose failing tests instead of blindly rerunning them.
allowed-tools: Bash, Read, Grep
---

# Test Failure Analysis

When a test fails:

- capture the exact failure
- identify the failing assertion
- inspect the stack trace
- determine whether the failure is:
  - implementation
  - test
  - environment
  - dependency
  - timing
  - flaky behavior

Fix the root cause.

Do not repeatedly rerun an unchanged failing test without new evidence.