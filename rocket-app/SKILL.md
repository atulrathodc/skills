---
name: rocket-app
description: Build, run, and debug Rocket (Rust) apps — route attributes, launch, Rocket.toml, catchers.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# Rocket App

Rocket (Rust, macro-driven) specifics.

1. **Build/run** — `cargo run` (dev), `cargo build --release`. Rocket needs `rocket = "0.5"` (or 0.4 — the API differs; match the version). First build is slow.
2. **Routes** — attribute macros: `#[get("/api/x")]`, `#[post("/api/x", data = "<body>")]`, `#[delete("/api/<id>")]`. A route that "doesn't exist" = the attribute path/method or it wasn't added in `routes![]`.
3. **Launch** — `#[launch] fn rocket() -> _ { rocket::build().mount("/", routes![handler1, handler2]) }`. A handler that 404s = it's missing from `routes![]`.
4. **Data** — request data via `data = "<x>"` + `Json<Req>` in the signature (needs `serde` + rocket's `json` feature). A 422/parse error = the body doesn't match the struct (see `input-validation`).
5. **State** — `rocket::State<Db>` as a handler arg; managed with `.manage(db)`. Missing `.manage` = a 500 "state is not managed".
6. **Config** — `Rocket.toml` (`[default] port = 8000`, `address`); env `ROCKET_PORT` overrides. See `configuration-loading`.
7. **Errors** — `#[catch(404)]`/`#[catch(500)]` catchers render error pages; without them a failing request returns a bare status.
8. **Verify** — `cargo run` in background, curl the route (see `make-it-run`, `http-api-testing`).
