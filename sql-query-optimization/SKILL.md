---
name: sql-query-optimization
description: Diagnose and fix slow SQL queries and ORM bottlenecks — EXPLAIN ANALYZE, N+1 query elimination, composite index column order, keyset/cursor pagination, connection pooling, and avoiding full table scans.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# SQL Query Optimization

Do not guess why a database query is slow. Inspect the actual SQL emitted by the ORM and read `EXPLAIN (ANALYZE, BUFFERS)` before adding indexes or rewriting queries.

1. **Eliminate N+1 queries first** — any loop issuing a `SELECT` per row (`for (const order of orders) await db.findItems(order.id)`) turns 100 rows into 101 round-trips. Replace with eager joins (`include` / `joinedload` / `JOIN FETCH`), batched `WHERE id IN (...)` lookups, or per-request DataLoaders.
2. **Read `EXPLAIN (ANALYZE, BUFFERS)` before adding an index** — look for `Seq Scan` on large tables, `Rows Removed by Filter`, external disk `Sort`, and huge row-estimate vs actual-row mismatches (indicating stale stats — run `ANALYZE table`). Measure before and after on realistic row counts.
3. **Design composite indexes with equality columns first, range/sort columns last** — for `WHERE tenant_id = $1 AND status = $2 AND created_at > $3 ORDER BY created_at DESC`, index `(tenant_id, status, created_at DESC)`. Leading-column order matters; an index on `(created_at, tenant_id)` cannot efficiently filter by `tenant_id` alone.
4. **Keep `WHERE` predicates sargable (index-friendly)** — wrapping an indexed column in a function (`WHERE LOWER(email) = ...`, `WHERE DATE(created_at) = '2026-01-01'`) disables standard B-tree indexes. Rewrite as range predicates (`created_at >= '2026-01-01' AND created_at < '2026-01-02'`) or create a matching expression index (`CREATE INDEX ON users (LOWER(email))`).
5. **Replace deep `OFFSET` pagination with keyset (cursor) pagination** — `OFFSET 50000 LIMIT 20` forces the DB to scan and discard 50,000 rows. Use `WHERE (created_at, id) < ($cursor_ts, $cursor_id) ORDER BY created_at DESC, id DESC LIMIT 20` backed by an index on `(created_at DESC, id DESC)`.
6. **Fetch only needed columns and bound every list query** — avoid `SELECT *` on wide tables with JSONB/text blobs, always enforce an upper `LIMIT` cap on API-facing queries, and use `EXISTS (SELECT 1 ...)` instead of `COUNT(*) > 0` when you only need a boolean check.
7. **Keep transactions short and configure connection pools cleanly** — never hold a DB transaction open across external HTTP calls, LLM requests, or file uploads (it holds row locks and exhausts pool connections). Size pools deliberately (`pgBouncer` / Prisma / HikariCP / SQLAlchemy pool) and watch idle-in-transaction sessions.
8. **Use SQLite WAL mode when running embedded SQLite** — enable `PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000; PRAGMA foreign_keys=ON;` to prevent `SQLITE_BUSY` write-lock failures under concurrent reads.

## Related skills

- `database-migrations` — adding `CREATE INDEX CONCURRENTLY` and safe schema updates.
- `caching-strategies` — caching hot read paths after queries are properly indexed.
- `graphql-and-rpc` — DataLoader batching for nested GraphQL resolvers.
- `data-modeling` — designing normalized schemas and constraints.
