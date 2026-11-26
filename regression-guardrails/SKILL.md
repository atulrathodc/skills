---
name: regression-guardrails
description: Prevent regressions during bug fixes, refactors, and feature changes — reproduce bugs as failing tests first, run affected test and typecheck gates, verify existing contracts remain intact, and guard against silent side-effect drift.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# Regression Guardrails

Fixing one bug while breaking two adjacent flows destroys velocity. Treat every change as guilty of causing a regression until verified across tests, types, and neighboring call sites.

1. **Capture every bug as a failing regression test before fixing it** — reproduce the exact reported input/state in a test, watch it fail with the exact bug, apply the minimal fix, and watch it pass. That permanently prevents the bug from reappearing in future edits.
2. **Audit every sibling caller and code path before finishing** — when fixing a bug in one handler, component, or query, `Grep` for the same pattern across the codebase so you don't leave identical bugs in sibling endpoints or break callers expecting the old return shape.
3. **Never weaken or delete a failing existing test to make CI green** — if an existing test fails after your change, assume your change broke an existing contract until you explicitly prove the test's expectation was intentionally superseded by the user's request.
4. **Run the full verification stack for the affected scope** — run typecheck (`tsc --noEmit` / `mypy` / `cargo check`), linter, unit tests, and relevant integration/build checks — not just the single new test you added.
5. **Check backward compatibility of data, configs, and APIs** — verify existing saved records, env vars, local storage/DB schemas, and client requests still work without requiring manual resets or breaking existing consumers.
6. **Inspect `git diff` line by line before declaring done** — catch accidental edits, leftover debug `console.log`/`print`, commented-out checks, unintended lockfile churn, or touched files outside the task's scope.
7. **Re-verify live behavior after non-trivial runtime changes** — for UI, server, or multi-service changes, verify the running app end-to-end (`browser-e2e-verification` or `runtime-verification`) rather than relying solely on unit tests.

## Related skills

- `root-cause-debugging` — isolating bugs before writing fixes.
- `systematic-refactoring` — keeping structural edits behavior-preserving.
- `unit-test-authoring` — writing crisp, deterministic regression tests.
- `completion-gate` — final verification checks before reporting done.
