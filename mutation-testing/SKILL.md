---
name: mutation-testing
description: Measure and strengthen test suite quality with mutation testing (/mutate) — Stryker, mutmut, PIT, cargo-mutants, targeting critical modules and changed files, killing surviving mutants, and distinguishing equivalent mutants.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# Mutation Testing

100% line coverage only proves your tests *executed* a line — not that they would fail if the logic broke. Mutation testing flips operators (`>` to `>=`, `&&` to `||`, removes `return`, negates conditions) to expose weak assertions and untested edge cases.

1. **Scope mutation runs to critical logic or changed files, never the entire repo at once** — full-repo mutation testing is slow. Target high-risk modules (auth, pricing, parsers, state machines, validators) or git-changed files (`npx stryker run --mutate 'src/billing/*.ts'`, `mutmut run --paths-to-mutate src/auth.py`, `cargo mutants --in-diff`).
2. **Ensure tests are fast, green, and deterministic before mutating** — a flaky or failing baseline test suite makes mutation results meaningless (mutants get killed by flakes or fail baseline). Fix test speed and stability first.
3. **Inspect surviving mutants by impact, not raw mutation score** — focus first on **survived** mutants in boundary conditions (`<` vs `<=`), auth/permission checks, error branches, and financial calculations. Do not chase 100% score by writing brittle tests for log strings or trivial boilerplate.
4. **Kill surviving mutants with behavioral tests, not mirror assertions** — when `if (qty >= 0)` survives mutation to `if (qty > 0)`, add a clean boundary test asserting `qty = 0` is accepted. Write assertions that validate observable domain contracts (`unit-test-authoring`), never tests that just copy-paste the implementation.
5. **Recognize and exclude equivalent mutants and non-behavioral code** — some mutations produce identical observable behavior (e.g., optimizing a loop bound or mutating a debug log format). Ignore logging/telemetry/generated code via config (`mutate: ['src/**/*.ts', '!src/**/*.test.ts', '!src/generated/**']`) instead of writing pointless assertions.
6. **Investigate `Timeout` and `NoCoverage` mutants differently** — `NoCoverage` means no test even executes that branch (add a unit test for the path); `Timeout` usually means a mutated loop became infinite (normally counts as killed, unless the test itself is too slow).
7. **Re-run mutation testing on the target file after adding tests** — confirm the targeted surviving mutants are now killed and that the normal test suite still passes cleanly and quickly.

## Related skills

- `unit-test-authoring` — writing behavioral boundary tests that kill real mutants.
- `test-coverage-analysis` — finding completely uncovered paths before mutating.
- `regression-guardrails` — locking fixes against future regressions.
- `test-driven-development` — building strong assertions from the start.
- `code-review` — reviewing test quality alongside production diffs.
