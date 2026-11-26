---
name: ddd-domain-events-and-sagas
description: Model and coordinate DDD Domain Events, eventual consistency across aggregates, transactional outbox dispatch, Process Managers / Sagas with compensating actions, and idempotent event handlers.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# DDD Domain Events and Sagas

Domain Events decouple *what just happened* in one aggregate from *what should react* in other aggregates or bounded contexts. They turn tangled cross-module transactions into explicit, resilient workflows.

1. **Name Domain Events as immutable past-tense business facts** — use `OrderPlaced`, `PaymentCaptured`, `SeatReserved`, `SubscriptionCanceled` — never imperative verbs (`SendEmail`, `UpdateInventory`) or generic CRUD names (`OrderUpdated`). Carry `eventId`, `occurredAt`, `aggregateId`, `aggregateVersion`, and the minimal domain data describing the fact.
2. **Record events inside the Aggregate, dispatch them after persistence commits** — have aggregate methods append events to an internal `uncommittedEvents` list (`this.record(new OrderPlaced(...))`). Never publish events to a message broker *before* the DB transaction commits — if the transaction rolls back, downstream consumers act on phantom facts that never happened.
3. **Use the Transactional Outbox for reliable event publication** — write the aggregate state AND its serialized Domain Events to an `outbox_events` table in the exact same database transaction. A background relay reads unpublished outbox rows and publishes them to the bus/queue, guaranteeing at-least-once delivery without dual-write bugs.
4. **Distinguish internal Domain Events from external Integration Events** — internal Domain Events can carry rich local domain concepts inside one Bounded Context; external Integration Events crossing Bounded Contexts must be a slim, versioned Published Language contract so internal refactors never break downstream services.
5. **Make every event handler strictly idempotent** — because at-least-once delivery will deliver duplicates on retries or crash recovery, deduplicate by `(eventId, handlerName)` inside the handler's transaction or design the state transition to be naturally idempotent.
6. **Use a Process Manager (Saga) for multi-step workflows across aggregates/contexts** — when a business process spans multiple bounded contexts (e.g., `OrderPlaced` → reserve inventory → capture payment → schedule shipment), model an explicit stateful Process Manager that listens to events, tracks workflow state, and issues commands to the next step.
7. **Model compensating actions for partial failures — there is no distributed rollback** — if inventory is reserved and payment fails, the Saga issues a `ReleaseInventory` command and marks the order `Failed`. Design every step to have a clear business compensation and a timeout deadline for stuck steps (e.g., reservation expires after 15 minutes).
8. **Avoid choreography spaghetti when workflows exceed 3–4 steps** — pure event choreography (A emits → B emits → C emits → D emits) becomes impossible to trace or debug as flows grow. Switch to an explicit Orchestrator / Process Manager so the entire workflow state machine is readable in one file.
9. **Test event flows end-to-end without a real broker first** — unit-test that aggregate commands emit the exact expected Domain Events, and integration-test Saga state transitions across happy paths, out-of-order arrivals, duplicate events, and compensation paths.

## Related skills

- `ddd-tactical-modeling` — recording domain events from aggregate roots.
- `ddd-strategic-design` — separating internal domain events from cross-context published language.
- `webhooks-and-events` — outbox relay, retries, backoff, and DLQ mechanics.
- `cqrs-and-event-sourcing` — projecting read models from domain events.
- `background-jobs` — running reliable outbox relays and saga timeout sweepers.
