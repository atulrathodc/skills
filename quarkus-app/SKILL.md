---
name: quarkus-app
description: Build, run, and debug Quarkus (Java) apps — dev mode, JAX-RS endpoints, Panache, native image.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# Quarkus App

Quarkus specifics (Java, fast startup + native).

1. **Dev mode** — `mvn quarkus:dev` (or `./mvnw`) — hot reload, live at `http://localhost:8080`. `mvn package` for production; `-Dquarkus.package.type=native` for native (needs GraalVM — slow; use JVM unless asked).
2. **Endpoints** — JAX-RS: `@Path("/api")` + `@GET`/`@POST` on a class or method; JSON via Jackson/JSON-B. `@Produces(MediaType.APPLICATION_JSON)`.
3. **Config** — `src/main/resources/application.properties` (or `application.yml`): `quarkus.http.port`, datasource URL (`quarkus.datasource.jdbc.url`), `quarkus.profile`. Env override: `QUARKUS_HTTP_PORT`. See `configuration-loading`.
4. **Data** — Panache/Hibernate: `@Entity` + `PanacheRepository`/`PanacheEntity`; JPA creates/validates the schema. A "table not found" = `quarkus.hibernate-orm.database.generation` setting (`update`/`validate`).
5. **Dev Services** — Quarkus auto-starts a test DB (H2/Postgres) in dev when no datasource URL is set; a "connection refused" means you overrode it to a real DB that isn't running (see `database-setup`).
6. **Security** — `quarkus.http.auth` / JWT; a 401 = auth config (see `authentication`).
7. **Verify** — `mvn quarkus:dev` (or run the jar), curl the endpoint (see `make-it-run`, `http-api-testing`).
