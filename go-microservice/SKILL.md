---
name: go-microservice
description: Build, test, and deploy production Go microservices (go.mod) — structured layout, net/http or Gin/Fiber/Echo servers with timeouts, context propagation, graceful shutdown, /health and /ready probes, slog logging, and static containers.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# Go Microservice

A production Go microservice needs five things from commit 1: explicit HTTP timeouts, `context.Context` propagation, graceful `SIGTERM` shutdown, `/health` + `/ready` endpoints, and `go test -race ./...`.

1. **Keep package layout clean and idiomatic** — place the binary entrypoint in `cmd/<service>/main.go`, private domain/handlers/stores under `internal/` (enforced by the Go compiler!), and only truly shared contracts in `pkg/` if needed. Avoid over-fragmented 1-file packages or circular imports.
2. **Configure `http.Server` and outbound `http.Client` timeouts explicitly** — never use bare `http.ListenAndServe` or `http.DefaultClient`. Set `ReadHeaderTimeout`, `ReadTimeout`, `WriteTimeout`, and `IdleTimeout` on `http.Server`, bind `0.0.0.0:$PORT`, and give every outbound client a concrete `Timeout` and shared `http.Transport`.
3. **Implement graceful shutdown on `SIGINT`/`SIGTERM`** — use `signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)`, run `srv.ListenAndServe()` in a goroutine, and on signal call `srv.Shutdown(shutdownCtx)` with a 10–15s deadline, then close DB pools and queues cleanly so in-flight requests finish without dropped connections.
4. **Propagate `r.Context()` through every DB query and downstream RPC** — when a client disconnects or times out, `r.Context()` cancels automatically, freeing DB queries and goroutines instead of letting zombie work pile up.
5. **Expose `/health` (liveness) and `/ready` (readiness) endpoints** — `/health` returns `200 OK` immediately; `/ready` pings the DB (`db.PingContext(ctx)`) / Redis with a short timeout and returns `503` if degraded so orchestrators stop routing traffic until dependencies recover.
6. **Use structured logging (`log/slog`) with request correlation** — log JSON to `stdout` with `request_id`, `method`, `path`, `status`, and `duration_ms` via middleware; propagate `X-Request-Id` on outbound calls and never log secrets or tokens.
7. **Test HTTP handlers and concurrency with `httptest` and `-race`** — write handler contract tests using `httptest.NewServer` / `httptest.NewRecorder` against real routers and middleware, and ALWAYS run `go vet ./... && go test -race ./...` before shipping.
8. **Package as a minimal static multi-stage container** — compile with `CGO_ENABLED=0 go build -trimpath -ldflags="-s -w" -o /out/server ./cmd/server` and copy into `gcr.io/distroless/static-debian12:nonroot` (UID 65532) with zero shell or root privileges.

## Related skills

- `go-app` — core Go language, error wrapping, interfaces, and profiling patterns.
- `microservices-orchestration` — composing Go services with gateways and healthchecks.
- `service-url-config-mapping` — env-based upstream service URL configuration.
- `docker-multistage-hardening` — building distroless non-root static Go images.
- `api-contract-testing` — testing HTTP routes, status codes, and JSON contracts.
