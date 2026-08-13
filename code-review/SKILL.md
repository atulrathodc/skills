---
name: code-review
description: Review a diff for correctness, regressions, and quality before it is merged.
allowed-tools: Read, Grep, Glob, Bash
---

# Code Review

Read the full diff before judging. Review in order:

- Correctness — does the change do what its description claims? Are edge cases handled?
- Regressions — does it break callers, behavior, or performance of existing code?
- Concurrency — shared state, locks, race windows.
- Security — injection, auth, secrets, unsafe deserialization (see security-review).
- Tests — does the change add or update tests that would fail without it?
- Scope — no unrelated edits, no commented-out code, no debug leftovers.
- Style — matches surrounding code; no gratuitous rewrites.

Prefer specific, actionable comments over general ones. Distinguish "must fix" from "nit". Never approve without reading the diff.
