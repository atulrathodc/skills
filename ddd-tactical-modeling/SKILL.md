---
name: ddd-tactical-modeling
description: Implement tactical Domain-Driven Design — aggregates and aggregate roots, entities vs immutable value objects, domain invariants, repositories, domain services, factories, and avoiding anemic domain models.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# DDD Tactical Modeling

Tactical DDD puts business invariants right where the state lives so invalid states become unrepresentable. Use it in Core Subdomains where business rules are complex; keep simple CRUD modules simple.

1. **Design small Aggregates around true transactional invariants** — an Aggregate is a consistency boundary, NOT an object graph mirroring every foreign key in the database. Include only the entities and value objects that MUST change atomically in one transaction to preserve a business rule (e.g., `Order` + `OrderLines` enforcing a max order total, not `Order` + `Customer` + `AllPastOrders`).
2. **Protect all state behind the Aggregate Root** — external code may only hold a reference to the Aggregate Root and mutate state through intention-revealing methods (`order.cancel(reason)`, `order.addItem(sku, qty)`), never via public setters (`order.setStatus("CANCELED")`) or mutating internal child lists directly.
3. **Reference other Aggregates by ID only, never by direct object reference** — store `customerId: CustomerId` instead of `customer: Customer`. Direct cross-aggregate references cause lazy-loading traps, giant transaction locks, and tangled persistence models.
4. **Modify one Aggregate per transaction** — updating two aggregates in one DB transaction couples their lifecycles and fails when they later move to separate stores. Update one aggregate atomically and emit a Domain Event to update other aggregates asynchronously (`ddd-domain-events-and-sagas`).
5. **Prefer Value Objects over primitives everywhere** — wrap concepts like `Money`, `EmailAddress`, `DateRange`, `Sku`, and `OrderId` in immutable, self-validating Value Objects compared by value (structural equality). Validate in the constructor/factory so once constructed, a `Money` or `EmailAddress` is guaranteed valid everywhere in the domain.
6. **Avoid Anemic Domain Models** — if your `Order` class is just a bag of getters/setters and all business rules live in `OrderService`, invariants get duplicated or bypassed across endpoints. Move state-transition rules and calculations onto the Entity/Value Object that owns the data.
7. **Use Domain Services only for stateless multi-aggregate domain logic** — when a business operation naturally spans multiple aggregates or concepts without belonging to one (e.g., `CurrencyConverter`, `TransferDomainService`), put it in a stateless Domain Service — distinct from Application Services (which orchestrate transactions, repositories, and side effects).
8. **Create one Repository interface per Aggregate Root** — define the repository interface in the domain layer using domain terms (`findById`, `save`, `findPendingForCustomer`), never returning raw ORM rows or exposing generic `IQueryable`/SQL builders to callers. Never create repositories for child entities inside an aggregate.
9. **Use Factories or static constructors for complex creation and reconstitution** — separate creating a brand-new aggregate (which enforces creation invariants and emits a `*Created` event) from reconstituting an existing aggregate from persistence (which restores stored state without re-emitting creation events).
10. **Enforce optimistic concurrency on Aggregates** — include a monotonic `version` field on each Aggregate Root checked on `save` (`WHERE id = $1 AND version = $2`) so two concurrent commands cannot silently overwrite each other's invariants.

## Related skills

- `ddd-strategic-design` — choosing bounded contexts and where tactical DDD is worth the cost.
- `ddd-domain-events-and-sagas` — emitting domain events from aggregates for cross-aggregate consistency.
- `hexagonal-and-clean-architecture` — keeping domain models decoupled from ORMs and frameworks.
- `cqrs-and-event-sourcing` — separating write aggregates from read projections.
- `type-safety` — using branded types and discriminated unions to make invalid states unrepresentable.
