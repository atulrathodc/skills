---
name: frontend-backend-integration
description: Match frontend API calls to backend routes/contracts and repair mismatches — endpoints, methods, payloads, CORS, dev proxy.
allowed-tools: Read, Grep, Glob, Bash, Edit, Write, List
---

# Frontend-Backend Integration

When a frontend can't talk to a backend, the mismatch is in the CONTRACT. Trace it — don't rewrite the app.

1. **Enumerate the frontend's API calls** — Grep for `fetch(` / `axios.` / `XMLHttpRequest` URLs in the frontend. List every endpoint + method it expects.
2. **Enumerate the backend's routes** — Grep for `@RequestMapping` / `@GetMapping` / `@PostMapping` (Spring), `@app.route` (Flask), `app.get`/`app.post` (Express/FastAPI). List every route the backend actually serves.
3. **Diff them. For each mismatch:**
   - **Wrong path or method** → fix the frontend URL (or the backend route) so the contract matches. Fix ONE side.
   - **Missing field / wrong payload shape** → align the request/response body (backend DTO ↔ frontend model).
   - **CORS** → the backend must allow the frontend origin (`Access-Control-Allow-Origin`), or use a dev proxy instead.
   - **Dev proxy** → Vite/webpack proxy config must point the frontend's API base at the backend URL/port.
4. **Verify the contract end-to-end** — start BOTH servers, hit a frontend action that calls the backend, and confirm the data round-trips.
5. Fix the ROOT CAUSE on one side — never patch both sides to compensate for a contract that one side should own.
