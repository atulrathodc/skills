---
name: service-url-config-mapping
description: Wire cross-service base URLs cleanly across local dev, Docker Compose, staging, and production — eliminating hardcoded localhost URLs, separating browser-public vs internal service URLs, and validating env var mappings at startup.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# Service URL Config Mapping

The #1 bug in multi-app repositories is a hardcoded `http://localhost:8000` buried in a frontend component, Vite config, or backend service that works on one laptop and breaks in Docker, preview deploys, or production.

1. **Never hardcode service URLs or ports in source code** — centralize every upstream URL in a single typed config module per service (`src/config.ts`, `config.py`, `application.yml`, `internal/config/config.go`) reading from explicit environment variables (`AUTH_SERVICE_URL`, `ORDERS_SERVICE_URL`, `VITE_API_BASE_URL`, `NEXT_PUBLIC_API_URL`).
2. **Distinguish Browser-Public URLs from Server-Internal URLs** — in SSR apps (Next.js, Nuxt, SvelteKit) and Dockerized stacks, the browser needs the public/host URL (`NEXT_PUBLIC_API_URL=http://localhost:8080` or `https://api.example.com`) while server-side fetches inside the container need the internal network URL (`INTERNAL_API_URL=http://api-gateway:8080`). Never mix the two.
3. **Understand build-time vs runtime frontend env vars** — Vite (`VITE_*`) and Next.js (`NEXT_PUBLIC_*`) bake client env vars into the JS bundle at *build time*. If the same Docker image must deploy to staging and prod, route browser calls through relative paths (`/api/...`) proxied by the gateway/Next.js rewrites, or inject a runtime `window.__CONFIG__` script.
4. **Normalize trailing slashes and base paths in one place** — strip trailing slashes (`url.replace(/\/+$/, '')`) when loading config so `${API_URL}/users` never produces `//users` (which breaks strict routers and signature checks).
5. **Keep `.env.example`, `docker-compose.yml`, and deployment manifests in lockstep** — whenever you add or rename a service URL env var, update `.env.example`, Compose service `environment:` blocks, and CI/deploy configs in the same edit so no environment silently falls back to a dead default.
6. **Fail fast at startup on missing or malformed service URLs** — validate required `*_URL` env vars with `new URL(...)` / Pydantic `AnyHttpUrl` on boot and exit with a clear message naming the missing variable instead of throwing `TypeError: Invalid URL` on the first user request.
7. **Configure local dev proxies cleanly to avoid CORS friction** — in Vite (`server.proxy`) or Next.js (`rewrites()`), proxy `/api` to `process.env.API_PROXY_TARGET || 'http://localhost:8080'` so local browser requests stay same-origin while still overridable in Docker/CI.
8. **Verify URL wiring across all target modes** — grep the repo for stray `localhost:` / `127.0.0.1:` literals outside config defaults and tests, and verify requests resolve cleanly in both local dev and containerized runs.

## Related skills

- `microservices-orchestration` — port allocation, startup ordering, and Docker Compose networking.
- `api-gateway-cors` — routing `/api` paths and configuring CORS origins cleanly.
- `configuration-loading` — env var precedence and startup config validation.
- `env-secrets-management` — keeping `.env` files, secrets, and config cleanly separated.
- `frontend-backend-integration` — wiring frontend clients to backend endpoints.
