---
name: rust-systems
description: Build, debug, and optimize Rust libraries, CLIs, and async services — Cargo workspaces, ownership/borrowing, Tokio async pitfalls, thiserror/anyhow error handling, clippy, unsafe boundaries, and release builds.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# Rust Systems

Let the compiler and `clippy` do the heavy lifting, and reserve complexity (lifetimes, `Arc<Mutex<...>>`, `unsafe`) for places that genuinely need it.

1. **Run the full compiler gate, not just `cargo build`** — run `cargo check --all-targets`, `cargo clippy --all-targets -- -D warnings`, and `cargo test`. Clippy catches subtle bugs (holding a `MutexGuard` across `.await`, unnecessary clones, integer overflows) that `rustc` allows.
2. **Never block an async runtime thread** — inside Tokio (`async fn`), calling `std::fs`, `std::thread::sleep`, synchronous DB drivers, or CPU-heavy loops stalls the worker thread and starves unrelated tasks. Use `tokio::fs`, `tokio::time::sleep`, or offload blocking/CPU work to `tokio::task::spawn_blocking`.
3. **Never hold a `std::sync::MutexGuard` across an `.await`** — it either fails to compile (`!Send`) or deadlocks the executor. Drop the guard in a tight lexical block `{ let v = *lock.lock().unwrap(); }` before awaiting, or use `tokio::sync::Mutex` only when you genuinely need lock ownership across async I/O.
4. **Use `thiserror` in libraries and `anyhow` in binaries** — library crates should expose typed, matchable error enums (`#[derive(thiserror::Error)]`) so callers can branch on failure modes; binary/CLI crates should use `anyhow::Result` with `.context("...")` for rich diagnostics. Avoid `.unwrap()` and `.expect()` in production paths unless an invariant is locally proven.
5. **Design ownership cleanly before reaching for `Rc`/`Arc` or lifetimes** — start with owned types (`String`, `Vec<T>`) and pass slices (`&str`, `&[T]`) at function boundaries. Add explicit lifetime parameters to structs only when zero-copy borrowing is actually on a hot path.
6. **Use Cargo workspaces for multi-crate repos** — centralize shared dependency versions under `[workspace.dependencies]` in the root `Cargo.toml` and inherit with `{ workspace = true }` so crates never compile duplicate major versions of `serde` or `tokio`.
7. **Keep `unsafe` minimal, isolated, and documented** — wrap `unsafe` in a small safe abstraction with a `// SAFETY:` comment stating the exact invariant that makes it sound, and run `cargo +nightly miri test` on unsafe data-structure or FFI code when available.
8. **Avoid accidental quadratic or memory-heavy patterns** — preallocate with `Vec::with_capacity` when size is known, prefer `BufReader`/`BufWriter` around `File` and `Stdout`, and use `serde_json::from_reader` / streaming for large payloads instead of loading everything into a `String`.
9. **Watch feature flags and compile times** — enable only needed Cargo features (e.g., `tokio = { version = "1", features = ["rt-multi-thread", "macros", "net", "signal"] }` instead of `"full"`). Run `cargo tree -d` to spot duplicate crate versions bloating compile time and binary size.
10. **Verify release builds separately from debug** — debug builds omit optimizations and keep integer overflow checks that release builds wrap by default. Configure `[profile.release]` intentionally (`lto = "thin"`, `strip = true`, `codegen-units = 1` when binary size/speed matters) and run `cargo test --release` on performance- or arithmetic-sensitive code.

## Related skills

- `axum-app` — building HTTP services with Axum and Tower.
- `actix-web-app` — building HTTP services with Actix Web.
- `rocket-app` — building HTTP services with Rocket.
- `cli-app` — argument parsing, exit codes, and TTY behavior for Rust CLIs.
- `concurrency-safety` — deadlocks, lock ordering, and cancellation safety.
