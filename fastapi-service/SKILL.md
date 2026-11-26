---
name: fastapi-service
description: Build, test, and ship production FastAPI services (requirements.txt / pyproject.toml) — Pydantic v2 models, async vs sync endpoint threadpools, lifespan startup/shutdown, Depends() DI, SQLAlchemy async sessions, and uvicorn deployment.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# FastAPI Service

FastAPI's biggest runtime trap is blocking the `asyncio` event loop inside an `async def` route. Match `async def` vs `def` to the actual I/O libraries you call, and validate every boundary with Pydantic v2.

1. **Never call blocking I/O inside `async def` endpoints** — calling `requests.get()`, synchronous `psycopg2`/SQLAlchemy, `time.sleep()`, or heavy CPU code inside `async def` freezes the entire event loop for all concurrent requests. Either use async clients (`httpx.AsyncClient`, `asyncpg`, `sqlalchemy.ext.asyncio`) OR declare the route as plain `def` (FastAPI runs sync `def` routes in a threadpool automatically).
2. **Use `lifespan` context managers instead of deprecated `@app.on_event`** — initialize DB connection pools, shared `httpx.AsyncClient`, and ML models in `@asynccontextmanager async def lifespan(app: FastAPI):` and close them cleanly after `yield`. Never create a new `httpx.AsyncClient()` or DB engine per request.
3. **Separate Pydantic request, response, and internal DB models** — define explicit `Create*`, `Update*`, and `*Response` Pydantic v2 schemas (`model_config = ConfigDict(from_attributes=True)`) and pass `response_model=` on routes so internal fields (`password_hash`, private metadata) never leak into JSON responses.
4. **Use `Depends()` cleanly for DB sessions, auth, and config** — yield per-request DB sessions from a dependency (`try: yield session; finally: await session.close()`), enforce auth/tenant checks via reusable dependencies, and load env config via `pydantic-settings` (`BaseSettings`) so missing env vars fail fast at boot.
5. **Handle errors consistently and expose `/health` + `/ready`** — raise `HTTPException` (or register custom `@app.exception_handler` for domain errors) with consistent JSON error envelopes; never return bare `500` tracebacks to clients. Provide `/health` (liveness) and `/ready` (DB/dependency check).
6. **Configure CORS, trusted hosts, and proxy headers explicitly** — configure `CORSMiddleware` with exact `allow_origins` from env (never `["*"]` with `allow_credentials=True`), and run `uvicorn` with `--proxy-headers` when behind Nginx/ALB/gateway.
7. **Test with `TestClient` / `httpx.AsyncClient` and dependency overrides** — override DB/auth dependencies cleanly via `app.dependency_overrides` in Pytest, test validation errors (`422`), auth failures (`401`/`403`), and real status codes, and verify `/openapi.json` builds without schema errors.
8. **Run production with `uvicorn` / `gunicorn` bound to `0.0.0.0:$PORT`** — never use `--reload` in production Dockerfiles; pin `requirements.txt` or `pyproject.toml` + `uv.lock`, and run as non-root in a slim multi-stage container.

## Related skills

- `api-contract-testing` — testing FastAPI schemas, status codes, and OpenAPI parity.
- `sql-query-optimization` — SQLAlchemy N+1 (`selectinload`/`joinedload`) and query tuning.
- `docker-multistage-hardening` — slim non-root Python container builds.
- `env-secrets-management` — `pydantic-settings` and safe secret handling.
