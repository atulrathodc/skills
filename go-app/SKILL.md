---
name: go-app
description: Build, test, debug, and ship Go services and CLIs — modules, context propagation, goroutine lifecycles, race detector, net/http timeouts, error wrapping, interfaces, and static binary builds.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# Go App

Go rewards boring, explicit code. Most production Go bugs come from leaked goroutines, missing HTTP timeouts, ignored errors, or accidental shared-memory races — all catchable before shipping.

1. **Always run tests with the race detector** — `go test -race ./...` catches data races that pass plain `go test` 99 times out of 100. Run `go vet ./...` alongside it; treat both as mandatory gates.
2. **Never use `http.DefaultClient` or bare `http.ListenAndServe` in production** — both have zero timeouts, so a single slow peer holds a goroutine and socket open forever. Configure `http.Server` with `ReadHeaderTimeout`, `ReadTimeout`, `WriteTimeout`, and `IdleTimeout`, and construct an `http.Client` with an explicit `Timeout` and bounded `http.Transport`.
3. **Propagate `context.Context` everywhere I/O happens** — accept `ctx context.Context` as the first parameter of every handler, DB query, and RPC call, and pass `r.Context()` downstream. Never store a `Context` in a struct; always call `defer cancel()` on `context.WithTimeout` / `context.WithCancel`.
4. **Every goroutine must have a known exit condition** — before writing `go func()`, answer how it stops when the request cancels or the process shuts down. Use `errgroup.WithContext` for fan-out work, close or select on `ctx.Done()` to prevent channel-send deadlocks, and shut down HTTP servers cleanly with `srv.Shutdown(ctx)` on `SIGINT`/`SIGTERM`.
5. **Wrap errors with `%w` and inspect with `errors.Is` / `errors.As`** — never compare error strings (`err.Error() == ...`) or swallow errors with `_`. Add concise operation context (`fmt.Errorf("load user %s: %w", id, err)`) once at each boundary without logging AND returning the same error at every layer.
6. **Define interfaces on the consumer side, keep them small** — accept interfaces, return concrete structs. Avoid premature 10-method `UserServiceInterface` definitions in the producer package; 1–3 method interfaces make unit testing with simple fakes effortless.
7. **Watch slice aliasing and loop/defer traps** — `append` on a sub-slice can overwrite the backing array unless you use a full slice expression (`s[:n:n]`) or `slices.Clone`. Avoid `defer` inside unbounded loops (resources stay open until the function returns); extract a helper function for per-iteration cleanup.
8. **Close and drain HTTP response bodies** — always `defer resp.Body.Close()` after checking `err == nil`, and drain unread bytes (`io.Copy(io.Discard, resp.Body)`) if you want keep-alive connection reuse.
9. **Keep `go.mod` tidy and reproducible** — run `go mod tidy` after dependency changes, commit `go.sum`, and avoid `replace` directives pointing to local paths in committed code.
10. **Build portable static binaries cleanly** — `CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -trimpath -ldflags="-s -w" -o bin/app ./cmd/app`. Verify `ldd` (or `file`) confirms no unintended libc dependency before copying into a `scratch` or `distroless` container.
11. **Profile before optimizing** — expose `net/http/pprof` on a localhost-only debug listener or run `go test -bench=. -benchmem -cpuprofile=cpu.out` and inspect with `go tool pprof`. Check `runtime.NumGoroutine()` when diagnosing memory growth.

## Related skills

- `concurrency-safety` — general race, lock ordering, and cancellation principles.
- `docker-container` — multi-stage static Go images (`scratch` / `distroless`).
- `http-api-testing` — verifying live Go HTTP endpoints end-to-end.
- `runtime-verification` — proving the compiled binary starts, serves, and shuts down cleanly.
