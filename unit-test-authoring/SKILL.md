---
name: unit-test-authoring
description: Write fast, high-signal, maintainable unit tests — test observable behavior instead of implementation details, cover edge cases and failure modes, avoid brittle mocks, and keep tests deterministic and independent.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# Unit Test Authoring

Good unit tests catch real bugs and survive refactoring. Bad unit tests mirror private implementation details, over-mock everything, and break whenever you rename an internal helper.

1. **Follow the repository's existing test runner, naming, and folder conventions** — inspect existing `*.test.*` / `*.spec.*` / `*_test.go` / `test_*.py` files first and match their framework (Vitest, Jest, Pytest, JUnit, `go test`, `cargo test`), assertion style, and helper utilities.
2. **Test observable behavior and invariants, never private internals** — call the public function/method/component and assert on returned values, thrown domain errors, or emitted events. Avoid asserting exact internal helper call counts unless the side effect itself is the contract.
3. **Structure every test cleanly with Arrange-Act-Assert** — keep each test focused on one behavior with a descriptive name stating scenario + expected outcome (`rejects negative quantities with ValidationError`, not `test1` or `works`).
4. **Cover the boundary and failure matrix, not just the happy path** — test empty inputs (`""`, `[]`, `null`/`undefined`), boundary values (`0`, `-1`, max limit), duplicates, invalid formats, permission denials, and error propagation.
5. **Prefer real collaborators and simple in-memory fakes over deep mock chains** — mocking 6 chained methods (`mockRepo.find.mockReturnValue(...)`) tests your mock wiring, not your code. Use pure functions, small fake implementations of port interfaces, and mock only true external I/O boundaries (network, clock, randomness).
6. **Make tests 100% deterministic and order-independent** — never depend on `Date.now()`, `Math.random()`, wall-clock `setTimeout`, network availability, or shared mutable state across tests. Inject fixed clocks/seeds and reset state in `beforeEach`.
7. **Use table-driven / parameterized tests for input-output matrices** — use `test.each` / `@pytest.mark.parametrize` / Go table tests for parsers, validators, pricing calculators, and permission matrices so adding a new edge case is one line.
8. **Verify every new test actually fails when the behavior is broken** — run the new test file directly (`npx vitest run <file>`, `pytest <file>`, `go test -run <Name> ./...`) and ensure assertions are specific (assert exact error type/message or payload, never just `toBeTruthy()`).

## Related skills

- `test-driven-development` — red-green-refactor workflow for new features and fixes.
- `regression-guardrails` — writing targeted regression tests that prevent bugs from returning.
- `integration-testing` — testing real DB, HTTP, and filesystem boundaries.
- `test-coverage-analysis` — identifying untested critical paths and branches.
- `test-failure-analysis` — diagnosing why a test failed (bug vs stale expectation vs flake).
