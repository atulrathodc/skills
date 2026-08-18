---
name: runtime-crash-recovery
description: Diagnose an app that STARTS but crashes or errors at runtime — unhandled exceptions, exit codes, OOM, segfaults.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# Runtime Crash Recovery

The app started but died or errors while handling a request. The FIRST stack frame / exit line names the crash site.

1. **Get the crash output** — re-run the request that crashes it, or read the background shell's output / the app's log. The FIRST stack frame is the cause; later frames are callers.
2. **Classify:**
   - **Unhandled exception / stack trace** → the throw site is the top frame. Fix the code there (null deref, bad key, wrong type).
   - **Exit code ≠ 0 with a message** → read the message; `ENOENT`/`EADDRINUSE`/`ECONNREFUSED` are environment, not logic.
   - **Out of memory / OOM killed** → unbounded loop, huge payload, or a missing GC/config; reduce allocation or raise the limit.
   - **Segfault / SIGSEGV (native)** → a native module bug or binary mismatch; rebuild the native dep (see `dependency-install-recovery`).
   - **Crash only on a specific request** → reproduce it with the exact request (see `http-api-testing`); the payload is the trigger.
3. **Fix the ROOT CAUSE** at the crash site — not a try/catch that swallows it.
4. **Restart and re-run the SAME request** — the crash must not recur before `done()`.
