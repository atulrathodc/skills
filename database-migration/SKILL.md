---
name: database-migration
description: Plan and apply schema changes safely and reversibly.
allowed-tools: Read, Grep, Glob, Bash
---

# Database Migration

- Read the migration tooling and existing migrations first; follow their pattern.
- Make migrations reversible — forward must have a defined backward.
- Additive changes first (add column), then backfill data, then enforce constraints.
- Backfill before adding NOT NULL or unique constraints on existing rows.
- Avoid locking large tables on hot paths; batch or defer where the schema allows.
- Test the migration against a copy of real data, not just an empty schema.
- Verify the result with a query, not just a success exit code.
