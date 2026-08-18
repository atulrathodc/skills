---
name: startup-failure-recovery
description: Diagnose why an app won't START — port in use, DB file locked, missing config/env, wrong working dir, missing module.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write, List
---

# Startup Failure Recovery

An app that "won't start" has ONE root cause hiding in the FIRST error of its startup log. Find it — don't guess, don't re-run the same start over and over.

1. **Get the full startup log** — re-run the start command, or read the background shell's output. The FIRST error is the cause; later lines are cascade noise.
2. **Classify the error:**
   - **Port already in use** → find the holder (`lsof -i :<port>` / `netstat -an`) and kill it, or change the port config.
   - **"database is already in use" / file lock** → a stale process holds the DB file. Kill it and delete stale lock/db files (`*.mv.db`, `*.lock`, `*.sqlite-wal`, `*.pid`).
   - **Module / class not found** → dependency not installed, or wrong main class / entrypoint.
   - **Wrong working directory** → run from the directory that contains the manifest (`package.json` / `pom.xml` / `manage.py`).
   - **Missing env / secret / config** → the app needs a variable the task implied; set it (respect the secrets policy — never print a real token).
   - **Exit 1 with no log** → the start command itself is wrong; check the manifest's start script.
3. **Apply the MINIMAL fix** — kill the stale process / free the port / set the config. One change, not a rewrite.
4. **Restart and re-probe** (curl / port check). Confirm the requested feature works before `done()`.
5. Never "fix" by disabling the failing check — fix the cause.
