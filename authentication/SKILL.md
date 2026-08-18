---
name: authentication
description: Implement or fix authentication — JWT, sessions, login flows, password hashing, Authorization headers, and the client side.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# Authentication

Auth is in almost every app. Trace the flow end-to-end — don't patch the symptom.

1. **Find the auth mechanism** — Grep for `jwt`, `bcrypt`, `session`, `@PreAuthorize`, `AuthenticationManager`, `passport`, `token`, `Authorization`. Identify: how tokens/sessions are created, stored, and verified.
2. **Verify the login flow first** — POST the login endpoint with the correct body, capture the token/session cookie, then call a protected endpoint WITH it (see `http-api-testing`). A 401/403 tells you WHERE it breaks.
3. **Common root causes:**
   - **Token not sent** — the client must send `Authorization: Bearer <token>`; a frontend that only logs in but never attaches the header gets 401.
   - **Token not verified / wrong secret** — server verifies against the wrong secret/issuer; check `JWT_SECRET`/`SPRING_DATASOURCE`-style config (see `configuration-loading`).
   - **Wrong user lookup** — login compares against a field (username/email) that doesn't match what's stored; check the query.
   - **Password hashing mismatch** — store with `bcrypt`/`Argon2`, never plaintext; a "login works then fails" is often a compare-against-wrong-hash.
   - **Session not persisted** — restart logs users out; fix the store (in-memory → DB/Redis), not the check.
   - **Security filter blocks the login route itself** — Spring Security must permit `/login`/`/register` while protecting the rest.
4. **Test the full matrix** — no token → 401; bad token → 401; valid token → 200; expired token → 401. Each is a distinct contract.
5. Only `done()` when the protected endpoint works with a real token and fails without one.
