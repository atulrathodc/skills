---
name: dependency-injection
description: Decouple code with dependency injection — inject dependencies, code to interfaces, and make components testable.
allowed-tools: Read, Grep, Glob, Edit, Write
---

# Dependency Injection

A class that constructs its own dependencies is impossible to test and hard to change. Inject them.

1. **Identify the hard-coded dependency** — `new HttpClient()`, direct `db.query`, a global config read inside a service. That's the coupling.
2. **Inject instead of construct** — pass the dependency in (constructor, method arg, or the framework's DI):
   - Spring: constructor injection (`@Autowired`/constructor) — never `new` a service inside another.
   - FastAPI: `Depends(...)`.
   - Node: pass `db`/`client` into the service constructor; plain JS needs no framework.
3. **Code to the interface/abstraction** — the service depends on `HttpClient`/`Repository` (the contract), not the concrete `AxiosHttpClient`/`JdbcRepository`. Swap implementations (fake, cache, retry wrapper) without touching the consumer.
4. **Why it matters** — with injection you can pass a FAKE in tests: no network, no DB, deterministic. A test that can't fake the dependency is the smell (see `test-driven-development`).
5. **Don't overdo it** — DI for the seams that actually change (DB, HTTP, time, config). Injecting a String is ceremony.
6. **Keep the graph simple** — a constructor with 8 params means the service does too much (see `code-organization`); extract, don't inject more.
