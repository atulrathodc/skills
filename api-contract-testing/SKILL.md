---
name: api-contract-testing
description: Verify HTTP and RPC API contracts across services and clients — status codes, JSON schemas, error envelopes, pagination, auth headers, backward compatibility, and OpenAPI/schema drift detection.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# API Contract Testing

Unit tests with mocked HTTP clients pass even when the frontend and backend disagree on field names, nullability, or status codes. Contract tests verify the exact wire interface both sides rely on.

1. **Test the real HTTP router, middleware, serializer, and validator** — exercise endpoints through the real app/test client (Supertest, FastAPI `TestClient`, Spring `MockMvc`/`WebTestClient`, Go `httptest.NewServer`) rather than calling controller functions directly and skipping routing, auth, and serialization.
2. **Assert exact response schemas, types, and nullability — not just HTTP `200`** — validate response bodies against the OpenAPI spec, Zod/Pydantic schema, or explicit structural assertions (`id` string, `amount` integer, ISO-8601 timestamps, required vs optional keys).
3. **Verify the full status-code and error-envelope matrix** — for every endpoint, test: valid request (`200`/`201`/`204`), malformed input (`400`/`422` with structured field errors), unauthenticated (`401`), unauthorized/wrong tenant (`403`/`404`), missing resource (`404`), and conflict/duplicate (`409`).
4. **Lock cross-service and frontend-backend contracts against silent drift** — when changing a backend response field, status code, or path, grep all consumer services and frontend API clients (`fetch`, Axios, generated SDKs) and update contract tests on both sides together.
5. **Verify headers, content types, and pagination contracts** — assert `Content-Type: application/json`, `Cache-Control`, `Location` (on `201`), pagination cursor/total fields, and empty-list behavior (`[]`, not `null` or `404`).
6. **Test idempotency and mutation side effects** — verify `PUT`/`DELETE` and `Idempotency-Key` `POST` endpoints behave safely when called twice, and confirm mutations actually persist by reading back via `GET`.
7. **Keep OpenAPI / JSON Schema specs in sync with code** — prefer generating OpenAPI from typed routes/schemas (FastAPI, NestJS/Swagger, Springdoc, Hono/Zod) or running a schema-diff check in CI so breaking removals or type changes fail before merge.
8. **Use isolated, deterministic test data** — seed per-test fixtures and clean up or roll back transactions so contract tests run reliably in parallel and never depend on live external APIs.

## Related skills

- `http-api-testing` — hitting and inspecting live HTTP endpoints.
- `api-design` — designing consistent status codes, pagination, and error envelopes.
- `integration-testing` — testing real database and service boundaries.
- `graphql-and-rpc` — contract and schema-breaking checks for GraphQL, tRPC, and gRPC.
- `authorization-and-multitenancy` — cross-tenant and role-based negative contract tests.
