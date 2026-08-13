---
name: regression-testing
description: Add tests that prevent a fixed bug from returning.
allowed-tools: Read, Grep, Glob, Bash
---

# Regression Testing

For a bug fix:

1. Identify the failure condition.
2. Reproduce it when practical.
3. Add a focused test.
4. Verify the test fails against the old behavior when possible.
5. Implement the fix.
6. Verify the test passes.
7. Run related tests.