---
name: microservices-deployment
description: Deploy N-service multi-app parent folders cleanly — dependency-ordered rollout, cross-service URL and env config mapping, multi-origin CORS, health-gated promotion, and coordinated rollback.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# Microservices Deployment

Deploying a parent folder containing N cooperating services (frontend + gateway + backend APIs + workers + shared DB/cache) fails when services deploy in the wrong order, point to stale localhost URLs, or reject each other's origins.

1. **Map the service dependency DAG before deploying anything** — list every service folder, its deploy target, its required env vars, its upstream dependencies, and its `/health` + `/ready` endpoints. Identify leaf services (no upstream HTTP deps) vs gateway/frontend services.
2. **Roll out bottom-up in dependency order, gating each tier on health** — deploy stateful infrastructure and migrations first → leaf backend services (verify `/ready` returns `200`) → composite/BFF/gateway services (verify upstream connectivity) → frontend apps last. Never deploy a frontend pointing at a backend URL that does not exist or isn't healthy yet.
3. **Wire cross-service URLs from deployed outputs, never hardcoded localhost** — capture each deployed backend's live URL (`AUTH_SERVICE_URL`, `ORDERS_SERVICE_URL`, `API_BASE_URL`) and inject it into downstream service env vars / build-time frontend vars (`VITE_*`, `NEXT_PUBLIC_*`) before building/restarting dependents.
4. **Configure multi-origin CORS explicitly across all deployed origins** — update `CORS_ALLOWED_ORIGINS` on the gateway/APIs to include every real deployed frontend origin (custom domain, preview URL, HF Space URL, GitHub Pages origin) without using wildcard `*` alongside credentials, and avoid duplicate CORS headers across gateway + downstream services.
5. **Keep schema and API changes backward-compatible across rolling deploys** — during an N-service rollout, old and new versions of neighboring services coexist briefly. Ship additive API fields and expand-and-contract DB migrations first so an older caller doesn't crash against a newly deployed service.
6. **Propagate shared auth, secrets, and request correlation consistently** — ensure every service verifying JWTs or internal tokens shares the exact same signing key/JWKS URL in the target environment, and forwards `X-Request-Id` so cross-service failures are traceable in logs.
7. **Verify the live end-to-end chain after all N services are up** — do not stop after individual `/health` checks pass. Execute a real user flow from the deployed frontend → gateway → downstream services → database and inspect live network calls and logs for `4xx`/`5xx`/CORS errors.
8. **Plan rollback in reverse order if a tier fails** — roll back the frontend/gateway first before rolling back a backend contract, and never drop newly added DB columns during a hot rollback.

## Related skills

- `microservices-orchestration` — local multi-service orchestration, ports, and Docker Compose.
- `service-url-config-mapping` — eliminating hardcoded localhost URLs across environments.
- `api-gateway-cors` — gateway routing, prefix stripping, and CORS headers.
- `deployment-strategy` — rollout shapes, env parity, and pre-deploy runbooks.
- `deployment-verification` — verifying live deployed services end-to-end.
