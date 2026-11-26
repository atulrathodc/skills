---
name: llm-app-integration
description: Build reliable production LLM features — structured JSON outputs with schema validation, SSE/NDJSON streaming, bounded tool-calling loops, retries and provider fallbacks, prompt caching, token budgets, and evals.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# LLM App Integration

Treat an LLM call like an unreliable, slow, variable-cost external microservice whose output is untrusted text until parsed and validated.

1. **Enforce structured outputs with strict schemas + runtime validation** — use native JSON Schema / structured-output modes when extracting data or driving UI state, and ALWAYS validate the parsed result with Zod/Pydantic on the server. On schema failure, either retry once with the exact validation error appended or fall back cleanly — never `JSON.parse` blindly without handling markdown fences, truncation, or missing fields.
2. **Stream user-facing text via SSE or NDJSON, never block 20 seconds for a full response** — forward token deltas immediately, handle client disconnects by passing an `AbortSignal` to the upstream LLM request (stopping generation and saving tokens), and flush cleanly on `[DONE]` or error frames.
3. **Bound every tool-calling loop strictly** — enforce a hard `maxSteps` cap, a wall-clock timeout, a token/cost budget, and loop detection (identical tool + args repeated consecutively). Always pass an explicit tool result (including structured error messages) back for every tool call ID so conversation history stays protocol-valid.
4. **Structure prompts for prefix/prompt caching** — put static system instructions, tool schemas, and unchanging reference context FIRST, and volatile per-request data (timestamps, user message, dynamic state) LAST. Changing a timestamp on line 1 invalidates the entire KV/prompt cache on every turn.
5. **Handle transient errors, rate limits, and context overflows explicitly** — retry `429`, `500`, `502`, `503`, and network resets with exponential backoff + jitter (respecting `Retry-After`). Do NOT retry `400` bad requests or context-length-exceeded errors blindly — compact/truncate older messages or route to a larger-context fallback model instead.
6. **Track tokens, latency (TTFT + total), and cost per feature** — log `model`, `prompt_tokens`, `cached_tokens`, `completion_tokens`, `ttft_ms`, `total_ms`, and `finish_reason` (`stop` vs `length` vs `tool_calls`) on every call. A `finish_reason === "length"` means your output was silently truncated and is likely invalid JSON.
7. **Separate prompt templates, model config, and business logic** — keep prompts versioned in dedicated modules/files with explicit inputs, pin exact model snapshots (not floating `-latest` aliases that silently change behavior), and keep temperature low (`0`–`0.2`) for extraction, routing, and code/tool tasks.
8. **Defend against prompt injection in untrusted inputs** — never concatenate untrusted web pages, emails, or user documents into system-level instructions; wrap external data in clear delimiters, validate all tool arguments on the server, and require user confirmation before destructive or external side-effect actions (sending emails, charging cards, deleting records).
9. **Gate prompt and model changes on an automated eval suite** — maintain 20–50 real representative test cases (including edge cases and past regressions) testing schema validity, tool selection accuracy, and answer quality before swapping models or rewriting prompts.

## Related skills

- `rag-and-search` — hybrid retrieval and grounding for knowledge-backed LLM apps.
- `agent-tools` — designing tool schemas and error outputs for tool-calling loops.
- `prompt-injection` — defending against direct and indirect prompt injection.
- `function-calling` — model-level function calling mechanics and benchmarks.
- `resilience` — timeouts, retries, and circuit breakers for external APIs.
