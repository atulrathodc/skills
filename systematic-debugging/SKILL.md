---
name: systematic-debugging
description: Debug bugs and failures methodically — reproduce, isolate, root-cause, fix, verify. Use whenever investigating a defect, crash, failing test, or unexpected behavior.
allowed-tools: Read, Grep, Glob, Bash, Edit
---

# Systematic Debugging

Work in this order. Do not skip ahead to fixes.

1. **Reproduce** — run the failing command/test and capture the exact error text. If you cannot reproduce it, say so and narrow the conditions first.
2. **Isolate** — find the smallest input/path that triggers it. Grep for the exact error string to locate the throw site; read the surrounding code, not just the top stack frame.
3. **Root cause** — state the mechanism in one sentence ("X happens because Y") before editing. If you cannot state it, you are guessing — gather one more piece of evidence instead.
4. **Fix the cause, not the symptom** — no try/catch around the pain, no special-casing the exact input that failed.
5. **Verify** — re-run the exact failing command, then the nearest test suite. Paste the failing output before and passing output after in your summary.

Anti-patterns: editing before reproducing, fixing the stack-trace line instead of the cause, declaring done because the error message changed (a *different* error is not a fix).
