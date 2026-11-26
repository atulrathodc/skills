---
name: root-cause-debugging
description: Diagnose bugs from first principles before editing — reproduce deterministically, isolate the failing layer, trace exact inputs/state, prevent retry loops on compile/type/runtime errors, and apply minimal targeted fixes.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# Root-Cause Debugging

Never patch a symptom or iterate blindly on failing commands. Two consecutive failed retries without a new hypothesis mean you are guessing — stop, read the exact failure, and isolate the cause.

1. **Read the full error and stack trace before touching any file** — find the FIRST error in compiler/build output and the deepest user-code frame in runtime traces. Downstream errors are usually cascades from line 1.
2. **Reproduce deterministically in the smallest scope possible** — run a single failing test file, curl one endpoint, or run the minimal build target instead of re-running the entire suite on every probe.
3. **Form a falsifiable hypothesis before every edit** — state *what* you believe is broken, *which line/value* proves it, and *what observation* will refute it. If an edit does not change the failure as predicted, revert it before trying the next hypothesis.
4. **Bisect the boundary when the cause is unclear** — split the failing path in half (client vs network vs handler vs service vs DB) and inspect actual runtime values at the midpoint rather than reading 20 files hoping to spot it.
5. **Break retry loops on compile, type, and dependency errors** — never re-run the same command hoping for a different result or tweak imports randomly. Inspect `tsconfig.json`, `package.json`, lockfiles, `go.mod`, or `pom.xml` to verify exact exported symbols, versions, and module resolution.
6. **Check environment and config drift early** — verify runtime version (`node -v`, `python3 --version`, `java -version`), active env vars, working directory, and stale build caches (`dist/`, `.next/`, `target/`, `__pycache__/`) when code looks right but behaves wrong.
7. **Fix the root cause with a minimal, targeted diff** — do not suppress errors with empty `catch {}`, `as any`, `@ts-ignore`, or loosened assertions. Fix the invariant violation at its origin without refactoring unrelated code.
8. **Lock the fix with a regression check** — add or update a focused test that fails before the fix and passes after, then re-run the full relevant test/build gate to confirm zero collateral breakage.

## Related skills

- `build-failure-recovery` — recovering cleanly from compile, bundler, and type errors.
- `runtime-crash-recovery` — diagnosing unhandled exceptions and process crashes.
- `agent-loop-recovery` — breaking out of stalled or repetitive tool loops.
- `minimal-change` — keeping fixes tightly scoped to the root cause.
