---
name: impact-analysis
description: Determine the files, modules, APIs, and tests potentially affected by a change.
allowed-tools: Read, Grep, Glob
---

# Impact Analysis

Before implementation:

- identify directly modified files
- identify callers
- identify dependencies
- identify public interfaces
- identify tests
- identify configuration
- identify generated artifacts
- identify potential backward compatibility issues

Separate:

- confirmed impact
- probable impact
- unknown impact

Do not treat guesses as confirmed dependencies.