---
name: cqrs-and-event-sourcing
description: Implement CQRS and Event Sourcing pragmatically — separating write models from read projections, append-only event streams, optimistic concurrency, snapshots, event upcasting, and deciding when NOT to use Event Sourcing.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# CQRS and Event Sourcing

CQRS is simple and broadly useful; Event Sourcing is powerful in audit-heavy domains and expensive everywhere else. Never adopt Event Sourcing just because you are using DDD or CQRS.

1. **Adopt CQRS independently of Event Sourcing** — you can separate Commands (write side: load aggregate, enforce invariants, persist) from Queries (read side: direct optimized SQL/DTO projections bypassing the domain model) over a single normal relational database. Avoid forcing list views, search pages, and dashboards to hydrate full write Aggregates.
2. **Keep Commands and Queries strictly separated** — a **Command** expresses intent (`CancelOrder`), mutates state, enforces invariants, and returns void or an ID/result status (not a full view model). A **Query** (`GetOrderDashboard`) is side-effect-free and reads directly from a denormalized view, SQL join, or search index shaped for the caller.
3. **Only use Event Sourcing when the full history IS the domain requirement** — strong fits: financial ledgers, double-entry accounting, regulatory audit trails, collaborative editing, temporal queries ("what was the balance on March 3?"). Weak fits: standard CRUD, user profiles, catalogs, settings — store current state plus an audit log instead.
4. **Treat the Event Store as an immutable append-only log with optimistic concurrency** — every event stream is keyed by `(stream_id, stream_version)` with a `UNIQUE(stream_id, stream_version)` constraint. Append new events with `expectedVersion`; if another writer appended first, reject with a concurrency conflict and retry the command.
5. **Rehydrate aggregates via pure `apply(event)` transitions** — split command handling into `decide(state, command) -> Event[]` (validates invariants, returns new events without mutating) and `apply(state, event) -> State` (pure, deterministic state fold that NEVER fails, NEVER calls external APIs, and NEVER generates timestamps/random IDs).
6. **Build idempotent, rebuildable Read Projections** — projections subscribe to the event stream, track their last processed global `position`/checkpoint, and upsert denormalized read tables (`INSERT ... ON CONFLICT DO UPDATE`). Because events are immutable, you must be able to wipe a projection table and replay from position 0 to add a new view or fix a projection bug.
7. **Handle Event Schema Evolution with upcasting — never edit historical events in place** — keep old event versions readable forever by adding optional fields with defaults or writing pure **upcasters** (`OrderPlacedV1 -> OrderPlacedV2`) at read time. Never mutate or delete past events in the store (except explicit GDPR crypto-shredding via per-user encryption keys).
8. **Add Snapshots only when stream replay actually gets slow** — most aggregates have 5–50 events and rehydrate in <1 ms. Only introduce periodic snapshots (e.g., every 100–500 events) for genuinely long-lived streams (accounts, ledgers), and always treat snapshots as disposable caches — never the source of truth.
9. **Design UI and APIs explicitly for eventual consistency on async projections** — if projections update asynchronously, a `POST /orders` followed immediately by `GET /orders` may not show the new row yet. Return the created resource ID/version from the command, use optimistic UI updates, or update critical same-DB projections synchronously inside the write transaction when immediate read-your-writes is required.
10. **Test Event-Sourced aggregates with Given-When-Then specs** — `Given(pastEvents) -> When(command) -> Then(expectedNewEvents or DomainError)`. These tests are concise, rock-solid, and directly express business behavior.

## Related skills

- `ddd-tactical-modeling` — write-side aggregate boundaries and invariants.
- `ddd-domain-events-and-sagas` — event naming, outbox dispatch, and sagas.
- `hexagonal-and-clean-architecture` — isolating event store and projection adapters.
- `sql-query-optimization` — indexing read projections and append-only event tables.
- `webhooks-and-events` — checkpointed, idempotent stream consumption.
