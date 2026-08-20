---
name: make-it-run
description: Get a newly built app actually RUNNING and verified — install deps, start it, probe it, confirm the feature responds. Use with runtime-verification to prove the COMPLETE behavior works.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write, List
---

# Make It Run

An app is not done until it RUNS and RESPONDS. "It compiles" is not done.

1. **Find the run command from the manifest** — read `package.json` / `pom.xml` / `requirements.txt` / `manage.py` / `Cargo.toml` / `go.mod` / README for the exact start command. Never guess it. (Language-agnostic: any stack.)
2. **Install dependencies first** — `npm install` / `mvn -q install` / `pip install -r requirements.txt` / `go mod tidy`. A build that skipped deps fails with confusing errors.
3. **Start the app in the background** (`Bash` with `run_in_background:true`) so the loop stays live. Note its port. If a process is already up, call `server_status` first — a STALE process (started before your edit) runs OLD code and will reproduce the bug forever.
4. **Probe it** — `curl` the URL/port, or check the port is listening. "Started" is not proof; a real HTTP response is. Probe the FEATURE route, not just `/`.
5. **If it does not start or respond** → use `startup-failure-recovery`: read the STARTUP LOG tail for the FIRST real error, not the scrollback.
6. **Verify the requested feature** — hit the endpoint the task asked for, not just the home page.
7. **Fix → restart (kill the old process first) → re-probe**, until it responds.
8. Only call `done()` when the app is RUNNING and the requested feature responds — and follow `runtime-verification` to prove the COMPLETE behavior works (correct status + body + UI round-trip), not just "the server is up".
