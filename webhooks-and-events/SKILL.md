---
name: webhooks-and-events
description: Build reliable inbound/outbound webhooks, message queues, and event-driven workflows — HMAC signature verification, raw-body parsing, idempotency, transactional outbox, retries with backoff, DLQs, and ordering.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# Webhooks and Events

Networks deliver events at least once, out of order, and occasionally twice in the same millisecond. Build every webhook receiver and queue consumer assuming duplicates, retries, and delayed arrivals are normal.

1. **Verify inbound webhook signatures on the exact raw request bytes** — compute the HMAC (`crypto.timingSafeEqual`) over the raw body buffer BEFORE JSON parsing. Re-serializing `JSON.stringify(req.body)` changes whitespace/key order and breaks signature verification. Also enforce a timestamp tolerance window (e.g., 5 minutes) to block replay attacks.
2. **Acknowledge webhooks fast, process asynchronously** — verify the signature, persist the event (or enqueue a job), and return `200`/`202` within 1–3 seconds. Doing slow DB work, PDF generation, or third-party calls inline causes sender timeouts and endless retry storms.
3. **Make every consumer strictly idempotent** — store processed `event_id` (or `idempotency_key`) with a unique constraint in the database inside the same transaction as the state change (`INSERT ... ON CONFLICT DO NOTHING`). Never rely solely on an in-memory set or TTL cache that resets on restart.
4. **Use the transactional outbox pattern for reliable publishing** — never do `await db.save(order); await queue.publish(orderCreated)` without an outbox if losing the event breaks invariants. If the process crashes between the two calls, the DB and downstream systems diverge permanently. Write the event row in the same DB transaction and relay it via a worker/CDC.
5. **Handle out-of-order delivery** — `order.paid` can arrive before `order.created`, or an older `updated` event can arrive after a newer one. Compare monotonic version numbers or timestamps (`WHERE updated_at < $event_ts`) or fetch current authoritative state from the source API when order matters.
6. **Use exponential backoff with jitter and a Dead-Letter Queue (DLQ)** — cap retry attempts, add random jitter to avoid thundering herds, and route permanently failing messages to a DLQ with the error reason and payload preserved for inspection and replay. Distinguish retryable errors (`429`, `5xx`, network timeouts) from permanent errors (`400`, schema violation) that should go straight to the DLQ.
7. **Design outbound webhooks for hostile or slow receivers** — enforce strict connect/read timeouts (5–10s), sign every delivery with a per-endpoint secret and timestamp header, include a unique `event_id`, block SSRF targets (private IPs, `169.254.169.254`, localhost) on user-configured webhook URLs, and auto-disable endpoints after sustained consecutive failures.
8. **Keep event payloads self-contained yet stable** — include `event_id`, `type`, `occurred_at`, `schema_version`, and resource identifiers. Treat event schemas like public APIs: add optional fields, never silently rename or change field types.
9. **Apply backpressure and bounded concurrency** — set explicit `concurrency` / prefetch limits on queue consumers so a burst of 100k events does not exhaust DB connections or OOM the worker.
10. **Test duplicate, out-of-order, and invalid-signature deliveries** — verify that replaying the same signed webhook payload twice produces identical final state (no double charges, duplicate emails, or constraint crashes), and that a tampered body returns `400`/`401`.

## Related skills

- `background-jobs` — worker lifecycle, scheduling, and job retries.
- `payments-and-billing` — Stripe and billing webhook state machines.
- `resilience` — circuit breakers, timeouts, and graceful degradation.
- `security-review` — SSRF and signature verification checks.
- `database-setup` — unique constraints and transactional outbox tables.
