---
name: ai-automation
description: Design and ship reliable AI-powered workflows and autonomous pipelines — deterministic code vs LLM boundaries, structured handoffs, human-in-the-loop checkpoints, idempotency, budget/loop caps, and replayable audit logs.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# AI Automation

The best AI automations use deterministic code for everything predictable and reserve LLMs strictly for judgment, synthesis, and unstructured transformation. Every unconstrained agentic loop in production eventually burns budget or takes an unintended action.

1. **Draw a sharp deterministic-vs-LLM boundary** — use regular code for routing rules, date math, schema validation, API pagination, auth, and database writes; use LLMs only for classifying unstructured text, extracting fields, summarizing, or drafting. If a step can be expressed cleanly in 20 lines of code, do not spend an LLM call on it.
2. **Use typed, validated handoffs between every pipeline stage** — pass strict JSON schemas (Zod/Pydantic) between steps rather than free-form prose summaries that drift and accumulate hallucinations across hops. Fail fast or route to a fallback branch if a stage's output violates its contract.
3. **Enforce hard cost, step, and time budgets per run** — cap `max_steps`, `max_tokens`, `max_usd`, and wall-clock duration on every workflow run. On budget exhaustion, halt gracefully, persist partial state, and alert rather than retrying indefinitely.
4. **Make every side-effecting step idempotent and resumable** — persist workflow state after each stage with a deterministic `run_id` + `step_id` idempotency key so a crash or retry at step 4 resumes from step 4 instead of re-sending step 2's email or re-running expensive LLM calls.
5. **Insert human-in-the-loop (HITL) approval gates for high-impact actions** — pause and surface a concise diff/preview for human approval before sending external communications, modifying billing/production data, or publishing content, until shadow-mode evals prove high accuracy.
6. **Roll out in shadow / dry-run mode before enabling autonomous writes** — run the automation on real triggers with write actions mocked/logged first, review 30–50 real outputs for edge cases and failure modes, then graduate to HITL, and only then to full autonomy.
7. **Prevent infinite trigger loops and webhook storms** — tag automated actions (e.g., bot actor ID, header, or metadata flag) and ignore self-triggered events so an AI workflow replying to an email, ticket, or PR comment never triggers itself in an endless loop.
8. **Log full replayable traces for every run** — record the exact input payload, prompt version, model ID, tool calls, latency, token cost, and final decision for each `run_id` (redacting secrets/PII). Without traces, debugging why an automation misclassified an item last Tuesday is pure guesswork.
9. **Build graceful degradation and dead-letter handling** — when an LLM provider is down or confidence is low, route the item to a human review queue or DLQ instead of silently dropping it or guessing blindly.

## Related skills

- `llm-app-integration` — structured outputs, retries, and streaming primitives.
- `agent-tools` — designing safe, bounded tools for automated agents.
- `webhooks-and-events` — idempotent triggers, queues, and DLQs.
- `background-jobs` — durable job execution, scheduling, and retries.
- `observability` — tracing, alerting, and cost monitoring for automated runs.
