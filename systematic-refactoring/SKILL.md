---
name: systematic-refactoring
description: Refactor existing code safely in small, behavior-preserving steps — establish characterization tests first, isolate structural changes from feature work, update all callers cleanly, and verify zero behavior drift.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# Systematic Refactoring

Refactoring changes internal structure without changing external behavior. Mixing structural rewrites with bug fixes or new features makes regressions nearly impossible to isolate.

1. **Lock current behavior with tests before moving a single line** — run existing tests first; if the target module lacks coverage, write quick characterization tests capturing its current inputs, outputs, and edge cases before refactoring.
2. **Never mix refactoring with feature changes in the same step** — finish the structural change with all tests green, then implement the new feature or bug fix cleanly on top of the simplified code.
3. **Map every caller and symbol reference before renaming or moving** — use `Grep` across the entire repo (including tests, configs, routes, templates, and dynamic imports) to list every reference before changing a function signature, export path, or type.
4. **Make small, atomic, reversible edits** — prefer a sequence of 3–5 tiny green steps (extract helper → unify callers → inline dead wrapper → delete unused file) over one giant 500-line rewrite that breaks the build for 20 minutes.
5. **Run typecheck and tests after every structural step** — if a step breaks compilation or tests in an unexpected place, fix or revert immediately while the diff is tiny.
6. **Eliminate duplication by finding the real abstraction, not premature indirection** — wait until 2–3 concrete call sites share the same invariant before extracting a shared helper; never create a parameterized mega-function full of boolean flags (`mode`, `isSpecial`, `skipCheck`).
7. **Preserve public API contracts and wire formats** — keep HTTP response shapes, CLI flags, exported library types, and DB column semantics identical unless a breaking change was explicitly requested.
8. **Clean up dead code and orphaned imports completely** — remove obsolete helpers, unused exports, and superseded files in the same pass so the codebase does not accumulate parallel "old vs new" implementations.

## Related skills

- `impact-analysis` — tracing blast radius before changing shared code.
- `dead-code` — identifying and removing unused code safely.
- `minimal-change` — keeping diffs focused and reviewable.
- `regression-guardrails` — verifying zero behavior regressions after changes.
