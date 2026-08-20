---
name: runtime-verification
description: PROVE a developed feature or fixed bug actually WORKS at runtime before done() — run the real app, probe the real endpoints, drive the real UI, confirm the complete behavior. Covers building, making it run, fixing errors/500s/crashes, verifying APIs, testing apps. An app that only compiles is not done; verify it runs, works, and is tested at runtime.
allowed-tools: Bash, Read, Grep, Glob, List, Write, Edit, browser
---

# Runtime Verification (complete behavior)

**An app is not done because it compiles. It is not done because a test passes.**
It is done only when the **real running app** performs the **complete behavior**
the user asked for. This skill is **language-agnostic** — it works for a Spring
Boot jar, a Node server, a React/Vite frontend, a Django app, a Go binary, a
Rust axum server, a Flask API, a .NET API — anything. Never assume a stack;
always read the manifest to learn the commands.

## The mandate: verify the COMPLETE behavior, not a compile

"Compiles", "unit tests pass", "the build succeeds" are all **necessary but not
sufficient**. A feature is verified only when you can demonstrate, against the
RUNNING app, the exact user-facing behavior from the task:

- "Add a chat endpoint" → the running server answers `POST /api/chat` with the
  expected payload (not just "the server started").
- "Fix the 500 on login" → the running app returns 200/302 on the login flow
  that previously 500'd (not just "it builds").
- "Build a todo UI" → the page loads in a real browser, a todo can be added and
  it appears in the list (not just "the frontend serves").

## The complete verification loop

### 1. Read the manifest — never guess the stack
Look for: `package.json` (npm/pnpm/yarn), `pom.xml` / `build.gradle`
(Maven/Gradle), `Cargo.toml` (Rust), `go.mod` (Go), `requirements.txt` /
`pyproject.toml` / `manage.py` / `app.py` (Python), `*.csproj` / `Program.cs`
(.NET), `Gemfile` (Ruby), `Dockerfile` / `docker-compose.yml`. Extract the
EXACT `start` / `run` / `dev` command and the port. Never guess the port or the
command — read it.

### 2. Install dependencies (only if the manifest needs it)
`npm install` / `pip install -r requirements.txt` / `mvn -q compile` / `go mod
tidy` — a run that skipped deps fails with confusing errors. Skip this if a
dependency lockfile already produced `node_modules`/equivalent.

### 3. Start the app for real
- Run the start command with `run_in_background:true` so the loop stays live.
- If the start command is a two-step (e.g. backend + frontend), start BOTH.
- If a process is already running, **check it is not STALE** — call
  `server_status` first; a process started before your edit is running OLD code
  and will reproduce the bug forever even though you fixed it. Restart onto the
  new build.

### 4. Probe the REAL feature, not the home page
- `curl` (or the browser tool) the **endpoint/route the task is about** — not
  just `/` or the health check. "Server responds" is not proof; **the feature
  responds correctly** is.
- Verify the actual behavior: correct status code, correct body, correct data
  round-trip (create → read it back → confirm what you created is there).
- A `curl` that returns 200 on `/` does NOT verify `/api/chat` works.

### 5. Drive the UI with the browser (when the feature is user-facing)
If the task involves a UI — page, form, button, navigation, error display —
**open a real headless browser** (`browser` tool) at the URL:
- Page loads without console errors / failed network requests.
- The exact user interaction works: fill the form, click the button, see the
  result render. A UI that "builds" but shows a blank page or a console error
  is NOT working.
- Confirm the frontend↔backend round-trip through the real UI path (the UI
  calls the API you built; the data must actually appear).

### 6. Fix → restart → re-probe, until the complete behavior works
When a probe fails: read the error, fix the ROOT CAUSE, **kill the old process**
and restart onto the new build (a stale process is the #1 reason the build
compiles but the bug persists), wait for readiness, and re-run the FULL flow.
Repeat until every step of the user-facing behavior returns what was asked for.

### 7. Only then call done()
Before `done()`, you must be able to state, from real observations:
- the app is running on the new build,
- the feature responds as requested (correct status + body),
- user-facing flows were driven through the real UI/browser,
- nothing the task asked for is unimplemented or erroring.

**Never** call `done()` when you only compiled, only ran unit tests, or only
verified the server is up. A feature that compiles but does not work at runtime
is a failed deliverable — the user gets no value from code that doesn't run.

## Related skills
- `make-it-run` — getting a newly built app started and responding.
- `startup-failure-recovery` / `runtime-crash-recovery` — the app fails to start
  or crashes; read the startup log tail for the FIRST real error.
- `ui-verification` — proving a running UI renders and its features work.
- `http-api-testing` — probing API endpoints with correct methods/bodies.
