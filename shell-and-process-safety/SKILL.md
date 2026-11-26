---
name: shell-and-process-safety
description: Execute shell commands and manage background processes safely — non-interactive flags, avoiding hanging pagers/prompts, port-conflict resolution, PID cleanup for dev servers, bounded output/timeouts, and destructive-command guards.
allowed-tools: Bash, Read, Grep, Glob
---

# Shell and Process Safety

A coding agent's fastest way to stall a session is launching an interactive prompt, a pager (`less`), or an unclosed dev server that hangs stdout forever or orphans processes on occupied ports.

1. **Always pass non-interactive flags so commands never hang waiting for stdin** — set `CI=true`, `GIT_PAGER=cat`, `PAGER=cat`, `DEBIAN_FRONTEND=noninteractive`, and pass `--yes` / `-y` / `--non-interactive` / `--no-input` (`npx --yes`, `npm create ... -- --yes`, `brew`, `apt-get -y`, `pytest -q`). Never run interactive editors (`vim`, `nano`), bare `git rebase -i`, or bare `less`/`top`.
2. **Manage background dev servers explicitly with PID tracking and log redirection** — when starting a server for verification, redirect stdout/stderr to a temp log file (`npm run dev >/tmp/app.log 2>&1 & echo $! >/tmp/app.pid`), poll its health URL with a bounded timeout (e.g., 30s) while checking `kill -0 $PID`, and ALWAYS terminate it cleanly (`kill $(cat /tmp/app.pid)`) when verification completes.
3. **Detect and resolve port conflicts cleanly before starting servers** — check `lsof -i :<port> -sTCP:LISTEN` before assuming a port is free. Never blindly `killall node` or `pkill -9 python` (which can kill the user's unrelated apps or tools); kill only the specific PID you spawned or pick a free port via `$PORT`.
4. **Bound command runtime and output volume** — wrap potentially hanging commands with explicit timeouts (`timeout` / `--max-time` on `curl`), limit noisy outputs (`git log -n 20`, `head -n 100`, `tail -n 80`), and use `--no-color` / quiet flags so huge logs don't flood context.
5. **Guard against destructive shell commands unconditionally** — never run `rm -rf /`, `rm -rf ~`, `rm -rf *` outside a verified scratch path, `git reset --hard`, `git clean -fdx`, `git push --force`, `DROP DATABASE`, or `chmod -R 777` without explicit user confirmation. Quote every variable expansion (`"$path"`) so spaces or empty variables never turn `rm -rf "$DIR/"*` into `rm -rf /*`.
6. **Check exit codes and fail fast in chained scripts** — use `set -euo pipefail` in multi-line scripts and `&&` (not `;`) between dependent steps so a failed build doesn't silently proceed into deploy or test steps.
7. **Inspect logs immediately when a background process exits early** — if a health poll fails or a process dies, read `/tmp/app.log` immediately to get the real root cause instead of retrying the same start command.

## Related skills

- `startup-failure-recovery` — diagnosing services that crash on boot.
- `runtime-verification` — verifying running servers and cleaning up afterward.
- `agent-loop-recovery` — breaking out of stalled commands or retry loops.
- `cli-app` — building CLIs that behave cleanly in non-TTY / CI environments.
- `git-recovery` — recovering safely from git mistakes without destructive resets.
