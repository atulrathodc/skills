---
name: graphql-and-rpc
description: Design, build, and debug GraphQL, tRPC, and gRPC APIs — DataLoader N+1 elimination, cursor pagination, query depth/cost limits, schema evolution, Protobuf wire compatibility, and typed error handling.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# GraphQL and RPC

GraphQL, tRPC, and gRPC trade REST's URL-centric conventions for typed schemas and procedures. Each has specific performance and compatibility traps that silently break production if ignored.

1. **Pick the right protocol for the boundary** — **tRPC** excels when client and server share a TypeScript monorepo; **gRPC** excels for low-latency service-to-service calls and streaming across polyglot backends; **GraphQL** excels when diverse clients (web, iOS, Android) need flexible nested reads over a rich domain graph. Don't adopt GraphQL for a simple CRUD app with one frontend.
2. **Eliminate GraphQL N+1 queries with per-request DataLoaders** — nested field resolvers (`User.posts`, `Post.author`) fire one SQL query per parent row by default. Instantiate a fresh `DataLoader` per request in context (NEVER globally — a global DataLoader leaks data across users and grows unboundedly) to batch and cache lookups within a single request.
3. **Protect GraphQL endpoints from abusive queries** — enforce max query depth, max query complexity/cost, pagination caps (`first <= 100`), and disable introspection in production if the API is not public. A 10-line cyclic query (`user { friends { friends { ... } } }`) can DoS an unprotected GraphQL server in milliseconds.
4. **Use cursor-based pagination (Relay Connection spec or opaque cursors)** — offset pagination (`OFFSET 10000`) scans and discards rows and duplicates/skips items when rows are inserted. Encode a stable sort key (e.g., `(created_at, id)`) as an opaque base64 cursor.
5. **Don't hide errors behind HTTP `200 OK` without structured error contracts** — GraphQL returns HTTP 200 even when `errors` is populated. Always map domain errors to explicit union/payload error types or structured `extensions.code` (`UNAUTHENTICATED`, `FORBIDDEN`, `NOT_FOUND`, `BAD_USER_INPUT`), and never leak raw stack traces or SQL messages in production.
6. **Follow strict Protobuf wire-compatibility rules for gRPC** — NEVER reuse a field number or change a field's wire type. When deleting a field, mark both its number and name as `reserved`. Always set explicit per-RPC deadlines (`context.WithTimeout`) and propagate cancellation across hops.
7. **Keep tRPC routers modular and validate every input** — compose domain sub-routers (`appRouter = router({ users, billing })`), validate every procedure's input with Zod/Valibot, and split `publicProcedure` vs `protectedProcedure` (middleware enforcing auth + tenant context) so authorization is never forgotten on a procedure.
8. **Evolve schemas additively — never break deployed mobile or external clients** — add new nullable fields/procedures first, mark old ones `@deprecated`, monitor usage, and remove only after old clients are retired. Run a schema diff check (`graphql-inspector`, `buf breaking`) in CI.
9. **Authorize in the business/domain layer, not just at the root query** — in GraphQL, the same `Order` or `User` type can be reached through five different parent paths; enforce object-level checks on the service/loader layer so no alternate path bypasses authorization.
10. **Verify query count and wire behavior in tests** — assert SQL query count on nested GraphQL queries (proving DataLoader batching works), test invalid inputs and unauthorized callers, and inspect generated client types after every schema change.

## Related skills

- `api-design` — general API contract, pagination, and error design principles.
- `authorization-and-multitenancy` — per-resolver and per-procedure access control.
- `sql-query-optimization` — query plans, indexes, and N+1 detection.
- `monorepo-management` — sharing tRPC routers and generated types across workspaces.
- `type-safety` — end-to-end schema-driven typing.
