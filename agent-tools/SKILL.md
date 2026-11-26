---
name: agent-tools
description: Design, implement, sandbox, and debug tools for AI coding and autonomous agents — minimal orthogonal tool surface, sharp schemas, actionable error messages, bounded outputs, idempotency, and confirmation gates.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# Agent Tools

An agent is only as reliable as its tools. Bloated tool lists, vague parameter descriptions, unbounded stdout dumps, and cryptic errors cause more agent failures than model capability limits.

1. **Keep the tool surface small, orthogonal, and high-leverage** — prefer a few composable primitives (`read_file`, `edit_file`, `search`, `run_command`) over 40 overlapping single-purpose wrappers. Every extra tool burns context tokens on every turn and increases tool-selection confusion, especially on smaller or local models.
2. **Write schemas and descriptions for the model, not a human SDK reference** — state *when* to use the tool, *when not* to use it, exact parameter formats (e.g., `"Absolute path"`, `"1-indexed line number"`), enums over free-text strings, and minimal required fields. Avoid deeply nested optional object trees that models routinely misformat.
3. **Bound and paginate every tool output** — never return 2 MB of `grep` output, minified JS, or `npm install` logs into the model's context window. Cap returned lines/bytes (e.g., 200 lines or 16 KB), return a clear truncation notice (`Showing 1-200 of 1,420 matches; narrow query or pass offset=200`), and strip noisy ANSI escape sequences.
4. **Return actionable, self-correcting error messages** — never return bare `"Error: failed"` or raw stack traces. Tell the model *why* it failed and *what to do next* (e.g., `"Target string not found in src/app.ts (lines 1-85). Re-read lines 40-70 with read_file and retry with an exact match."`).
5. **Enforce strict filesystem, network, and command sandboxing** — canonicalize and verify paths (`realpath`) against allowed workspace roots to block `../` and symlink escapes; enforce hard wall-clock timeouts and output caps on shell commands; kill entire process groups on timeout so zombie child processes don't linger.
6. **Gate irreversible or high-blast-radius actions** — classify tools by risk (read-only / local reversible write / external or destructive side effect). Require explicit user confirmation or dry-run previews for destructive commands, credentialed network calls, git force-push, or external messaging.
7. **Make edits safe and verifiable** — require exact context matching (or line-range verification) on file edits so stale line numbers cannot corrupt a file, and return a concise diff or confirmation summary rather than echoing the entire file back.
8. **Support cancellation and concurrency safety** — pass an `AbortSignal` into every long-running tool, serialize conflicting writes to the same resource, and mark read-only tools clearly so the runtime can safely execute them in parallel.
9. **Test tools with adversarial and malformed model inputs** — unit-test missing required fields, wrong types, non-existent paths, binary files, huge outputs, hanging commands, and concurrent calls. A tool must NEVER crash the agent loop with an unhandled exception — always return a structured tool-error payload.

## Related skills

- `mcp-servers` — exposing tools over the Model Context Protocol.
- `llm-app-integration` — wiring bounded tool-calling loops and schema validation.
- `tool-selection` — helping agents choose the right tool cleanly.
- `agent-loop-recovery` — recovering when tool calls fail or stall repeatedly.
- `context-management` — keeping tool outputs within the active token budget.
