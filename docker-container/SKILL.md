---
name: docker-container
description: Dockerize and run an app — Dockerfile, docker-compose, build, port mapping, volumes, and troubleshooting container failures.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# Docker Container

Containerize a running app so it runs anywhere.

1. **Read the app's run contract first** — how it starts (`node server.js`, `uvicorn app:app`, `java -jar`), what port, what config/env it needs. The Dockerfile must reproduce that.
2. **Write a minimal Dockerfile** — base image that matches the stack (`node:20-alpine`, `python:3.12-slim`, `eclipse-temurin:21-jre`), copy the manifest, install deps, `EXPOSE <port>`, and the SAME start command as `CMD`. Add a `.dockerignore` (node_modules, .git, .mini).
3. **Run** — `docker build -t <name> .` then `docker run -p <host>:<port> <name>`. A host port maps OUTSIDE; the container port must match the app's `server.port`/`PORT`.
4. **Compose for multi-service** — `docker-compose.yml` for app + db (postgres/mysql) + redis: `services`, `ports`, `volumes`, `depends_on`.
5. **Troubleshoot:**
   - Build fails → the FIRST `Step`/`ERROR` line names it (missing file, bad base, install failure → see `dependency-install-recovery`).
   - `port is already allocated` → kill the container holding it (`docker ps`, `docker rm -f`).
   - Container exits immediately → `docker logs <id>` — the app crashed at start (see `startup-failure-recovery`).
   - App can't reach the DB → use the service name as the host inside compose, not `localhost`.
6. **Verify from outside** — `curl http://localhost:<hostPort>/...` returns the expected response (see `http-api-testing`).
