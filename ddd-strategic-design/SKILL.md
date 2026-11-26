---
name: ddd-strategic-design
description: Apply strategic Domain-Driven Design — bounded contexts, ubiquitous language, core vs supporting vs generic subdomains, context mapping (ACL, Published Language, Open Host Service), and avoiding distributed monoliths.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# DDD Strategic Design

Strategic DDD decides *where the boundaries go* before you write a single class or microservice. Getting boundaries wrong creates a tangled big ball of mud or a chatty distributed monolith that no tactical pattern can rescue.

1. **Classify subdomains before investing architecture effort** — split the problem space into **Core** (your competitive differentiator — model deeply and build in-house), **Supporting** (necessary glue — keep simple CRUD/transaction-script), and **Generic** (auth, billing, email — buy or use an off-the-shelf library). Never over-engineer a generic subdomain with heavy tactical DDD.
2. **Enforce Ubiquitous Language inside each Bounded Context** — use the exact business terms domain experts use in code, types, file names, events, and tests (`Policy`, `Claim`, `Underwrite` — not generic `RecordManager` or `DataProcessor`). If the same word means two different things to two teams (e.g., `Account` in Billing vs Auth), that is a strong signal of two separate Bounded Contexts.
3. **Never share a single database schema or ORM entity across Bounded Contexts** — each Bounded Context owns its own data model and persistence tables (separate schemas or modules with strict import boundaries even in a modular monolith). Joining tables across contexts couples deployments and breaks invariants.
4. **Start as a Modular Monolith before splitting into microservices** — a Bounded Context is a *logical* boundary, not automatically a network boundary. Enforce module boundaries via packages/lint rules and explicit public facades first; extract a network service only when scaling, deployment cadence, or team ownership actually requires it.
5. **Choose an explicit Context Mapping pattern at every integration boundary** — document how upstream and downstream contexts interact:
   - **Anti-Corruption Layer (ACL):** Translate an ugly legacy or third-party model into your clean local domain model at the edge so foreign concepts never leak inward.
   - **Open Host Service + Published Language:** Expose a stable, versioned API or event schema when many downstream consumers depend on an upstream context.
   - **Conformist:** Adopt the upstream model directly only when you have no leverage and the cost of translation exceeds the benefit.
   - **Shared Kernel:** Share a tiny, explicitly governed library only between tightly collaborating teams; keep it minimal or it becomes a coupling magnet.
6. **Avoid CRUD-mirroring bounded contexts** — do not slice contexts by technical layer (`users-service`, `emails-service`, `db-service`) or single database tables; slice around cohesive business capabilities and workflows (`Catalog`, `Ordering`, `Fulfillment`, `Billing`).
7. **Keep cross-context communication explicit and decoupled** — prefer asynchronous integration events (Published Language) for cross-context reactions and narrow synchronous queries only when real-time data is strictly required. Never let one context directly mutate another context's internal state.
8. **Maintain a living Context Map in the repo** — keep a concise diagram or markdown map (`docs/architecture/context-map.md`) listing each Bounded Context, its owner, its core aggregates, and its upstream/downstream contracts so new contributors and agents do not accidentally bridge boundaries.

## Related skills

- `ddd-tactical-modeling` — aggregates, entities, value objects, and repositories inside a bounded context.
- `ddd-domain-events-and-sagas` — coordinating workflows across bounded contexts via domain events.
- `hexagonal-and-clean-architecture` — enforcing inward dependency boundaries in code.
- `ownership-boundaries` — aligning code and module ownership with domain boundaries.
- `architecture-discovery` — mapping an existing codebase before refactoring boundaries.
