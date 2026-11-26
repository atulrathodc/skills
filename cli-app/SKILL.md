---
name: cli-app
description: Design, build, and test ergonomic CLI applications — subcommands and flags, stdout vs stderr separation, exit codes, TTY/piping detection, --json output, signal handling, config precedence, and distribution.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# CLI App

A good CLI works both for a human at a terminal and for a shell pipeline or AI agent scripting it. Most CLI bugs happen when human-facing output leaks into machine-readable streams.

1. **Separate `stdout` and `stderr` strictly** — `stdout` is for primary command output (data, JSON, file contents, generated artifacts); `stderr` is for progress spinners, logs, warnings, and errors. A user piping `mycli list --json | jq .` must never see a warning or spinner break JSON parsing.
2. **Return meaningful exit codes** — `0` for success, `1` for general runtime failure, `2` for invalid CLI arguments/usage, and distinct non-zero codes only when documented. Never print an error message and exit `0`.
3. **Detect TTY and respect `NO_COLOR`** — only render ANSI colors, spinners, tables, or interactive prompts when `stdout`/`stderr` is an interactive TTY AND `NO_COLOR` is unset. When piped or in CI (`CI=true`), fall back automatically to plain, line-oriented output and never hang waiting for interactive input — fail fast with a message telling the user which flag to pass.
4. **Support `--json` (or `--format json`) on data-returning commands** — emit stable, documented JSON (or NDJSON for streaming) so scripts and agents can consume the CLI without fragile regex scraping.
5. **Follow standard flag and config precedence** — CLI flags override environment variables, which override project config files, which override user config (`$XDG_CONFIG_HOME/<app>`), which override built-in defaults. Support `--help` / `-h` and `--version` / `-V` on the root and every subcommand.
6. **Support stdin (`-`) and stdout for file arguments** — allow `mycli transform -` or piped stdin when no input file is given, and avoid writing temp files into the current working directory.
7. **Handle `SIGINT`, `SIGTERM`, and `SIGPIPE` cleanly** — trap `SIGINT`/`SIGTERM` to flush buffers, clean up temp files, and restore terminal cursor/raw mode before exiting with `130`/`143`. When piped into `head` (`mycli dump | head -n 5`), exit cleanly on broken pipe (`EPIPE`) instead of dumping a stack trace.
8. **Write actionable error messages** — state what failed, the exact path/input/flag involved, and how to fix it (e.g., `Error: config file "/path/config.toml" not found. Run "mycli init" or pass --config <path>.`). Never print raw stack traces to end users unless `--verbose` or `DEBUG=1` is set.
9. **Protect destructive operations** — require `--yes`/`--force` when non-interactive, offer `--dry-run` for bulk/destructive commands, and write files atomically (write to temp file in same directory, then rename) so a Ctrl-C never leaves a half-written config.
10. **Test the real binary as a black box** — spawn the compiled binary (or `node dist/cli.js`) in tests asserting exact `exitCode`, `stdout`, and `stderr` across: valid args, invalid flags, piped stdin, non-TTY mode, missing files, and `--json` parsing.

## Related skills

- `ink` — interactive terminal UIs in Node/React when a TUI is actually needed.
- `go-app` — shipping zero-dependency static CLI binaries in Go.
- `rust-systems` — fast native CLIs with `clap` and `anyhow`.
- `package-publishing` — distributing CLIs via npm, PyPI, crates.io, or Homebrew.
- `configuration-loading` — env var and config file resolution.
