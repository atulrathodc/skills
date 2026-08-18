---
name: database-setup
description: Get a local database running for an app — H2, SQLite, Postgres — connection URL, driver, and the run/migrate step.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# Database Setup

A running app usually needs a running database. Get the DB up, then prove the app can connect.

1. **Pick the DB the app expects** (from the manifest / connection config — Spring Boot `application.properties`, `package.json`, `requirements.txt`):
   - **H2** (Spring Boot default) → in-memory (`jdbc:h2:mem:testdb`) or file (`jdbc:h2:file:./data/db`). A file DB gets locked by a stale process — kill it and delete stale `*.mv.db`/`*.lock` (see `startup-failure-recovery`).
   - **SQLite** → a single file (`sqlite:///./app.db`); create it with the schema if missing.
   - **Postgres** → start it (`brew services start postgresql` or docker `docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=... postgres`), then create the database.
2. **Connection URL + credentials** — set them in the app's config/env (DB_URL / SPRING_DATASOURCE_URL / DATABASE_URL). Use a dev password, never a real secret.
3. **Apply the schema** — run the app's migration (JPA auto-create, `flask db upgrade`, `prisma migrate dev`, or the SQL file) so tables exist.
4. **Prove the connection** — run a trivial query through the app (`curl` an endpoint that reads/writes), not just "the server started".
5. Only `done()` when the app reads/writes the DB successfully.
