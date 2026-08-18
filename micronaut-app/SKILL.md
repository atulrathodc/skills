---
name: micronaut-app
description: Build, run, and debug Micronaut (Java) apps — mn CLI, controllers, compile-time DI, application.yml.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# Micronaut App

Micronaut specifics (Java, compile-time DI).

1. **CLI/run** — `mn` CLI or `./mvnw`/`./gradlew run` (dev), `run` hot-reloads. Production: `./gradlew run` or the `application` jar.
2. **Controllers** — `@Controller("/api")` + `@Get`/`@Post`; JSON via Jackson. A method without a route annotation isn't exposed.
3. **Compile-time DI** — `@Inject`/constructor injection resolved at COMPILE time; a missing bean fails the build with a clear "no bean of type X" — fix the missing `@Singleton`/`@Repository`, don't add `new`.
4. **Config** — `src/main/resources/application.yml` (`micronaut.server.port`, datasource `jdbc-url`); env override `MICRONAUT_SERVER_PORT`. See `configuration-loading`.
5. **Data** — Micronaut Data: `@Repository` interface + `@JdbcRepository`/`@MongoRepository`; a query method named by convention (`findByEmail`) must match a field, or it fails at startup.
6. **Verify** — run it, curl the endpoint (see `make-it-run`, `http-api-testing`). A startup error names the missing bean/config in the FIRST log line.
