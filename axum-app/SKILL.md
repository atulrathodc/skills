---
name: axum-app
description: Build, run, and debug Axum (Rust) apps — routing, handlers, extractors, state, tokio.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# Axum App

Axum (Rust, on tokio) specifics.

1. **Build/run** — `cargo run` (dev), `cargo build --release` (production). First build is SLOW (compiles all deps) — be patient, don't restart it. If `cargo run` blocks, it may be downloading crates.
2. **Bootstrap** — `Router::new().route("/api/x", get(handler))`; serve with `axum::serve(listener, app).await`. Port from `std::env::var("PORT")`.
3. **Handlers** — `async fn handler(State(db): State<Db>, Json(body): Json<CreateReq>) -> impl IntoResponse`. Return types: `Json(...)`, `StatusCode`, or `(StatusCode, Json(...))` for errors.
4. **Extractors** — the argument list IS the request parsing: `Path(id)`, `Query(params)`, `Json(body)`, `State(shared)`, `HeaderMap`. A handler that "doesn't compile" is usually a wrong extractor ordering or a missing `FromRequest` impl (body type not `Deserialize`).
5. **State** — `Router::new().with_state(db)` makes `State<Db>` injectable; a missing `.with_state` = "State<Db> is required" compile error.
6. **Shared `Arc`** — the DB/client must be `Arc<Mutex<...>>` or cloneable to share across handlers. A borrow error is a lifetime issue — use `Arc`.
7. **JSON** — add `serde` + `axum`'s `json` feature; missing features = "the trait bound ... is not satisfied".
8. **Verify** — `cargo run` in background, curl the route (see `make-it-run`, `http-api-testing`). The compiler error names the fix — read the FIRST one.
