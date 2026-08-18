---
name: spring-boot-app
description: Develop and run Spring Boot apps — Maven lifecycle, application.properties, port, H2, REST controllers, security.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write, List
---

# Spring Boot App

Spring Boot specifics that trip up agents.

1. **Build** — `mvn -q compile` / `mvn -q package` (bare `mvn` can block on interactive input). Use the project wrapper (`./mvnw`) when present.
2. **Run** — `mvn spring-boot:run`, or `java -jar target/*.jar` after `package`. Start it in the BACKGROUND; note `server.port`.
3. **Port** — set `server.port` in `src/main/resources/application.properties` (or `application.yml`, or the `SERVER_PORT` env). Default is 8080.
4. **H2 / DB file lock** — "H2 database is already in use" means a STALE Java process holds the DB file. Kill it (`lsof -i :<port>`, `jps`, `ps`) and delete stale `*.mv.db` / `*.lock` files before restart (see `startup-failure-recovery`).
5. **REST** — `@RestController` + `@GetMapping`/`@PostMapping`; DTOs serialize to JSON automatically. **Spring Security may block requests** — permit the app's endpoints or configure the security filter chain, or the frontend gets 401/403.
6. **CORS** — if a frontend calls the API, allow its origin or use a dev proxy (see `frontend-backend-integration`).
7. **Verify** — curl the controller endpoint. On startup failure, read the FIRST log line — it names the cause (port, DB lock, missing bean, bad config).
