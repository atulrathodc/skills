---
name: dependency-management
description: Safely add, remove, upgrade, and evaluate project dependencies.
allowed-tools: Read, Grep, Glob, Bash
---

# Dependency Management

Before adding a dependency:

- check whether an existing dependency already provides the capability
- inspect package/build configuration
- consider maintenance and compatibility
- verify supported runtime versions

After changes:

- update lockfiles when appropriate
- run relevant tests
- verify the build