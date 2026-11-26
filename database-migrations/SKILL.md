---
name: database-migrations
description: Author, test, and deploy zero-downtime database migrations safely (Prisma, Alembic, Flyway, Liquibase, Goose, Drizzle) — expand-and-contract, safe locking, backfilling, reversibility, and verifying against real data.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# Database Migrations

Bad schema migrations cause production outages, locked tables, and irreversible data loss. Always use the project's migration tool, never mutate applied migrations, and treat every production schema change as a multi-step rollout.

1. **Follow the repository's existing migration tool and naming sequence** — inspect existing migrations (Prisma, Drizzle, Alembic, Flyway, Liquibase, Goose, Rails/Django migrations) before creating a new one. Never run ad-hoc `ALTER TABLE` manually in production or edit an already-applied migration file (checksums will fail on every other environment).
2. **Use Expand-and-Contract for breaking changes (renames, type changes, drops)** — never rename or drop a column in one deploy while old app instances are still reading it:
   - **Expand:** Add the new nullable column/table.
   - **Dual-write & backfill:** Deploy code writing both, backfill existing rows in small batches, then switch reads to the new column.
   - **Contract:** Remove the old column in a later deploy once zero running code references it.
3. **Never add `NOT NULL` or `UNIQUE` constraints on populated tables without a safe path** — backfill existing rows first (or use a constant `DEFAULT` in Postgres 11+ where instant), and add constraints with `NOT VALID` followed by `VALIDATE CONSTRAINT` in Postgres so writes are not blocked during full-table scans.
4. **Build indexes without locking production traffic** — in PostgreSQL, use `CREATE INDEX CONCURRENTLY` (outside a transaction block) so reads and writes stay unblocked on large tables; avoid table-rewriting operations (`ALTER COLUMN TYPE` changing storage layout) during peak traffic.
5. **Keep migrations idempotent and reversible where feasible** — write explicit `down` / rollback scripts for additive changes, and make seed/backfill scripts safe to re-run (`ON CONFLICT DO NOTHING`) if a deploy retries.
6. **Separate schema migrations from heavy data backfills** — keep migration files fast (seconds, not hours). Run multi-million-row backfills via batched background jobs with throttling so deploys don't time out or saturate I/O.
7. **Test migrations against realistic data, not just an empty DB** — run `up` → verify schema & queries → run `down` → run `up` again against a local database seeded with realistic rows (including nulls, edge values, and foreign keys) to catch constraint failures before production.

## Related skills

- `database-setup` — database initialization, roles, and connection config.
- `sql-query-optimization` — indexing and query-plan impact of schema changes.
- `deployment-strategy` — coordinating migrations with blue-green/rolling deploys.
- `data-modeling` — entity relationships, normalization, and constraints.
