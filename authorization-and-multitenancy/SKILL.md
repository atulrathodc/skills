---
name: authorization-and-multitenancy
description: Implement and audit authorization (RBAC/ABAC), object-level access control, tenant isolation, Postgres RLS, and IDOR prevention across APIs, queries, caches, and background jobs.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# Authorization and Multi-Tenancy

Authentication proves *who* the caller is; authorization proves *what they may touch*. Almost every severe data-leak bug in SaaS apps is a missing object-level or tenant-scope check on an authenticated endpoint.

1. **Default-deny every route and resolver** — require explicit authorization policy on every endpoint, GraphQL resolver, RPC method, and server action. Public routes must be explicitly allowlisted; an unannotated route must fail closed with `403`/`401`.
2. **Enforce object-level authorization (prevent IDOR) on every read and write** — never look up a record by `id` alone (`WHERE id = $1`). Scope every query by the authenticated principal or tenant (`WHERE id = $1 AND tenant_id = $2`), and verify ownership/role before returning or mutating any nested resource (comments, attachments, export jobs).
3. **Derive `tenant_id` and `user_id` exclusively from the verified session/token** — never trust `tenantId`, `orgId`, `userId`, or `role` sent in request bodies, query strings, or custom headers unless the server explicitly verifies the authenticated user belongs to that tenant with the required role.
4. **Centralize policy checks instead of scattering `if (user.role === 'admin')`** — put permission rules in a dedicated policy/guard layer (e.g., `can(actor, action, resource)`) so HTTP handlers, WebSockets, and background jobs enforce identical rules and are easy to audit and unit-test.
5. **Use database-level Row-Level Security (RLS) as defense-in-depth for Postgres multi-tenancy** — set `SET LOCAL app.tenant_id = ...` inside each transaction and enforce `CREATE POLICY` on tenant tables so a forgotten `WHERE tenant_id = ...` cannot leak cross-tenant rows. Verify your app connects as a non-superuser role (superusers and `BYPASSRLS` roles skip RLS!).
6. **Scope caches, search indexes, storage keys, and queues by tenant** — include `tenant_id` in every Redis cache key, S3/R2 object prefix, search filter, and job payload. A shared cache key like `invoice:123` or an unscoped vector/full-text search is a cross-tenant leak waiting to happen.
7. **Return `404` vs `403` deliberately** — when a user requests a resource ID belonging to another tenant, return `404 Not Found` so attackers cannot enumerate valid IDs across tenants. Use `403 Forbidden` when the user is authorized to know the resource exists (e.g., same org, insufficient role).
8. **Guard privilege escalation and mass assignment** — never spread `req.body` directly into a DB update (`User.update(req.body)`), which lets callers overwrite `role`, `tenant_id`, or `plan`. Explicitly allowlist updatable fields per role, and forbid users from granting roles higher than their own.
9. **Re-check permissions on async and webhook flows** — when a user queues an export, invite, or bulk job, re-verify permissions at execution time (or sign/scope the job narrowly) in case their role was revoked between enqueue and execution.
10. **Write explicit cross-tenant negative tests** — for every resource endpoint, test at least: unauthenticated (`401`), authenticated wrong-tenant user (`404`/`403`), authenticated same-tenant lower-role user (`403`), and authorized user (`200`). Never mark an authz change done without a failing-then-passing cross-tenant test.

## Related skills

- `authentication` — verifying identity, sessions, and JWTs before authorization runs.
- `security-review` — broader vulnerability checklist across changes.
- `input-validation` — preventing mass assignment and schema tampering.
- `database-setup` — roles, schemas, and Postgres RLS configuration.
- `integration-testing` — testing real cross-tenant boundaries end-to-end.
