---
name: fastapi-app
description: Build, run, and debug FastAPI (Python) apps — pydantic models, async handlers, uvicorn, auto docs, DI.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# FastAPI App

FastAPI specifics (Python, async, typed).

1. **Bootstrap** — `app = FastAPI()`; run with `uvicorn main:app --port <port>` (see `python-web-app`). Interactive docs at `/docs` — a fast way to verify routes.
2. **Pydantic models** — the request/response types are `BaseModel` subclasses with typed fields. A 422 validation error = the body doesn't match the model; the error names the field (see `input-validation`).
3. **Handlers** — `@app.get('/x')` / `@app.post('/x')`; use `async def` for I/O-bound work. A handler that blocks sync I/O on async hurts throughput (see `background-jobs`).
4. **DI** — `def get_db()` + `Depends(get_db)` injects dependencies per-request (see `dependency-injection`). A "field required" on a query param = it's missing the default or the type.
5. **Config** — `pydantic-settings`/env for `PORT`, DB URL (see `configuration-loading`).
6. **Verify** — start uvicorn in background, curl the endpoint AND `/docs` (see `make-it-run`, `http-api-testing`).
