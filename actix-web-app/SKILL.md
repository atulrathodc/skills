---
name: actix-web-app
description: Build, run, and debug Actix Web (Rust) apps — App/routes, handlers, extractors, middleware.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# Actix Web App

Actix Web (Rust) specifics.

1. **Build/run** — `cargo run` (dev), `cargo build --release`. First build is slow — don't restart it mid-compile.
2. **Bootstrap** — `HttpServer::new(|| App::new().service(web::resource("/api/x").route(web::get().to(handler))))`; bind `("0.0.0.0", port)`. Port from env.
3. **Handlers** — `async fn handler(path: web::Path<(u32,)>, body: web::Json<Req>, data: web::Data<Db>) -> impl Responder`. Return `web::Json(...)`, `HttpResponse::BadRequest().json(...)` for errors.
4. **Extractors** — `web::Path`, `web::Query`, `web::Json` (needs `Deserialize`), `web::Data` (shared state). A "not implemented" trait error = wrong extractor or missing serde derive.
5. **Shared state** — `web::Data::new(db)` inserted into the app; handlers take `data: web::Data<Db>`. Missing `.app_data(web::Data::new(...))` = a panic "Data not available" at request time.
6. **Middleware** — `App::new().wrap(...)` for CORS/auth/logging (see `authentication`, `frontend-backend-integration`).
7. **Verify** — `cargo run` in background, curl the route (see `make-it-run`, `http-api-testing`).
