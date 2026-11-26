---
name: microservices-orchestration
description: Design, run, and verify multi-service and multi-app repositories — startup ordering, health/readiness endpoints, port allocation, Docker Compose / local dev orchestration, inter-service discovery, and graceful shutdown.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# Microservices Orchestration

Multi-app parent folders (frontend + gateway + backend services + DB/cache) fail most often at the seams: port collisions, services booting before dependencies are ready, hardcoded `localhost` URLs inside Docker, or missing health endpoints.

1. **Inventory every service, port, and dependency before editing or starting** — map each app directory, its runtime/build command, its listening port, its health endpoint, and which upstream services/DBs it calls. Never guess ports or duplicate an already-assigned port.
2. **Give every service explicit `/health` (liveness) and `/ready` (readiness) endpoints** — `/health` returns `200` if the process is alive; `/ready` verifies critical dependencies (DB connection, Redis, required upstream config) before accepting traffic. Use these in Docker Compose `healthcheck`, Kubernetes probes, and local startup scripts.
3. **Enforce dependency-aware startup ordering, never blind `sleep 5`** — in `docker-compose.yml`, pair `depends_on: { db: { condition: service_healthy } }` with real `healthcheck` commands (`pg_isready`, `redis-cli ping`, `curl -sf http://localhost:$PORT/health`). In local scripts, poll health endpoints with a bounded timeout and fail with the service's logs if it doesn't come up.
4. **Separate container-internal hostnames from host/browser URLs** — inside Docker Compose, service A calls `http://orders-service:8081` (Docker service name + internal port), NEVER `http://localhost:8081` (which points to container A itself!). Meanwhile, the browser running on the host calls the gateway/host-mapped URL (`http://localhost:3000` or `/api`).
5. **Avoid port collisions across services in multi-app repos** — assign a clean, non-overlapping port table (e.g., frontend `3000`/`5173`, gateway `8080`, auth `8081`, orders `8082`, Postgres `5432`, Redis `6379`) and make every port configurable via `$PORT` / env vars.
6. **Keep inter-service calls resilient and bounded** — set explicit HTTP/gRPC connect + request timeouts, propagate correlation/trace IDs (`X-Request-Id`) across hops, and avoid circular synchronous call chains (A → B → A) that deadlock under load.
7. **Provide a single reproducible local start command** — ensure `docker compose up --build` (or a root `dev` script) brings up the entire stack cleanly from a fresh checkout with `.env.example` documented.
8. **Verify the full orchestrated stack end-to-end** — confirm every container/process reaches `healthy`, check logs for startup errors, test a real request flowing from frontend → gateway → downstream service → DB, and tear down cleanly (`docker compose down`) when done.

## Related skills

- `service-url-config-mapping` — wiring cross-service base URLs across local, Docker, and cloud envs.
- `api-gateway-cors` — routing, CORS, and header forwarding at the gateway boundary.
- `docker-container` — containerizing individual services cleanly.
- `kubernetes-deployment` — running multi-service workloads in Kubernetes.
- `resilience` — timeouts, retries, and circuit breakers between services.
