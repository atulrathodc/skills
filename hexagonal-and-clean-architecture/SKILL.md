---
name: hexagonal-and-clean-architecture
description: Structure DDD applications with Hexagonal (Ports and Adapters) and Clean Architecture — inward dependency rule, pure domain layer, application use cases, driving vs driven adapters, ORM isolation, and fast unit testing.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# Hexagonal and Clean Architecture

Hexagonal (Ports & Adapters) and Clean Architecture exist for one practical reason: keeping your core business logic testable, readable, and independent of HTTP frameworks, ORMs, queues, and third-party SDKs.

1. **Enforce the strict inward dependency rule** — dependencies may ONLY point inward: `Adapters / Infrastructure` → `Application (Use Cases)` → `Domain (Entities, Value Objects, Domain Services, Ports)`. The `domain/` directory must have ZERO imports from Express/Fastify/Next.js/Spring, Prisma/TypeORM/SQLAlchemy, AWS SDK, or `fetch`.
2. **Define Ports in the inner layer and Adapters in the outer layer** — **Driving (inbound) ports** are your Application Services / Use Cases (`PlaceOrderUseCase`), called by HTTP controllers, CLI commands, or queue consumers. **Driven (outbound) ports** are narrow interfaces defined by the domain/application (`OrderRepository`, `PaymentGateway`, `Clock`), implemented by concrete adapters (`PostgresOrderRepository`, `StripePaymentGateway`, `SystemClock`).
3. **Separate Application Services (Use Cases) from Domain logic** — an Application Service is a thin orchestrator: start transaction → load aggregate via repository port → invoke domain method → save aggregate → publish outbox events → return DTO. Put ZERO business invariant checks in controllers and ZERO SQL/HTTP calls in domain entities.
4. **Never leak ORM entities or HTTP DTOs into the Domain** — keep persistence models (ORM rows/tables) and API request/response schemas in the adapter layer, and map explicitly at the boundary (`toDomain()` / `toPersistence()`). Letting `@Entity` / Prisma types double as domain models forces DB column constraints and nullable join hacks into your business rules.
5. **Inject non-deterministic dependencies through ports** — abstract `Clock` (`now()`), `IdGenerator` (UUID/ULID), and randomness behind tiny ports injected at the composition root. Deterministic time and IDs eliminate flaky tests for expirations, billing cycles, and audit timestamps.
6. **Wire everything in a single Composition Root** — instantiate concrete adapters, repositories, and use cases at application startup (`src/main.ts` or DI container bootstrap) and pass them down via constructor injection. Never reach into global singletons or service locators from inside the domain or application layers.
7. **Keep error translation at the adapter boundary** — domain and application layers throw or return typed domain errors (`InsufficientFundsError`, `OrderAlreadyShippedError`), never HTTP status codes (`409 Conflict`). HTTP controllers map domain errors to HTTP status codes; gRPC/CLI adapters map them to gRPC codes or exit codes.
8. **Enforce layer boundaries automatically in CI** — do not rely on code review alone to keep `domain/` clean. Add an architecture lint rule (`eslint-plugin-boundaries`, `dependency-cruiser`, ArchUnit, or Go `internal/` packages) that fails the build if `domain/` imports `infrastructure/` or framework packages.
9. **Exploit the payoff in your test pyramid** — test 80%+ of business rules with millisecond-fast in-memory unit tests against pure domain objects and use cases with in-memory fake repositories; reserve slower Docker/DB integration tests for verifying the real SQL/HTTP adapters against the same port contract tests.

## Related skills

- `ddd-tactical-modeling` — designing the entities, value objects, and aggregates inside the domain core.
- `ddd-strategic-design` — organizing multiple hexagonal bounded contexts in a modular monolith.
- `dependency-injection` — wiring ports and adapters cleanly at the composition root.
- `code-organization` — directory layout and module structure conventions.
- `integration-testing` — writing contract tests for real database and HTTP adapters.
