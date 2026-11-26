---
name: api-gateway-cors
description: Configure API gateways, reverse proxies, and CORS cleanly in multi-service apps — path prefix stripping, exact origin allowlists with credentials, OPTIONS preflight handling, WebSocket upgrades, and forwarding Host/X-Forwarded-* headers.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# API Gateway and CORS

In multi-app architectures, the gateway is where browser security (CORS, cookies), path routing, and backend services meet. A single misconfigured header or duplicate CORS rule breaks every frontend call.

1. **Set CORS headers in ONE place — never both at the gateway AND in downstream services** — if both Nginx/Gateway and FastAPI/Spring emit `Access-Control-Allow-Origin`, browsers reject the response (`contains multiple values 'http://localhost:3000, http://localhost:3000'`). Own CORS at the edge gateway and disable duplicate CORS headers on internal-only services.
2. **Never use wildcard `*` origin when `Access-Control-Allow-Credentials: true` is enabled** — browsers strictly block `*` with cookies or `Authorization` credentials. Configure an explicit comma-separated `CORS_ALLOWED_ORIGINS` env var allowlist (`http://localhost:3000,http://localhost:5173,https://app.example.com`) and return `Vary: Origin`.
3. **Ensure `OPTIONS` preflight requests succeed without auth** — preflight requests never carry `Authorization` headers or cookies. If your gateway's JWT middleware runs before CORS handling, every cross-origin `POST`/`PUT`/`DELETE` fails with `401` on `OPTIONS`. Allow `OPTIONS` through CORS first and return `204` with `Access-Control-Allow-Methods` and `Access-Control-Allow-Headers` (`Authorization, Content-Type, X-Request-Id`).
4. **Be explicit about path prefix stripping** — decide clearly whether `/api/orders/123` proxies to `http://orders:8082/orders/123` (stripped) or `http://orders:8082/api/orders/123` (preserved). Mismatched prefix stripping is the #1 cause of `404` through a gateway when direct service calls return `200`.
5. **Forward `X-Forwarded-For`, `X-Forwarded-Proto`, `X-Forwarded-Host`, and `X-Request-Id`** — downstream services need these to construct redirect URLs, enforce HTTPS/cookies, rate-limit real client IPs, and correlate logs across services.
6. **Configure proxy timeouts, body size limits, and WebSocket/SSE upgrades explicitly** — disable proxy buffering (`proxy_buffering off`) on SSE/streaming routes, pass `Upgrade` and `Connection: upgrade` headers for WebSockets, and set upload body limits (`client_max_body_size`) to match your app's contract.
7. **Expose a unified gateway health endpoint without leaking internal topology** — expose `/health` on the gateway and route only intended public prefixes; never proxy internal admin/metrics endpoints (`/actuator`, `/metrics`, `/debug/pprof`) to the public internet.
8. **Verify preflight and actual requests with `curl` before testing in the browser** — run `curl -i -X OPTIONS -H "Origin: http://localhost:3000" -H "Access-Control-Request-Method: POST" -H "Access-Control-Request-Headers: Authorization, Content-Type" http://localhost:8080/api/...` and confirm exact `204`/`200` status and single `Access-Control-Allow-*` headers.

## Related skills

- `microservices-orchestration` — running the gateway alongside downstream services.
- `service-url-config-mapping` — wiring gateway and upstream service URLs cleanly.
- `rate-limiting-and-web-security` — CORS, CSP, cookies, and rate limiting at the edge.
- `browser-network-debugging` — inspecting CORS and preflight failures in DevTools.
- `http-api-testing` — testing gateway routes and headers with `curl`.
