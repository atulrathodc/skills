---
name: auth-security-hardening
description: Harden authentication, authorization, and web/API security — Argon2/bcrypt hashing, short-lived JWT + refresh rotation, HttpOnly/Secure/SameSite cookies, IDOR/SQLi/XSS/SSRF prevention, and negative auth test matrices.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# Auth and Security Hardening

Broken authentication, missing object-level authorization, SQL/command injection, and XSS are the highest-impact vulnerabilities coding agents introduce when rushing features. Verify every security boundary explicitly.

1. **Hash passwords with Argon2id or bcrypt — never MD5/SHA/plaintext** — use a strong per-password salt and work factor, compare hashes and API tokens with constant-time functions (`crypto.timingSafeEqual` / `hmac.compare_digest`), and never log raw passwords or tokens.
2. **Keep access tokens short-lived and harden session cookies** — prefer short-lived JWTs (5–15 min) with rotating, revocable refresh tokens stored hashed in the DB, or opaque server-side sessions in Redis/DB. Set `HttpOnly`, `Secure`, and `SameSite=Lax` (or `Strict`) on session cookies; never store long-lived auth tokens in `localStorage` when cookies are feasible.
3. **Verify JWT algorithm, signature, `iss`, `aud`, and `exp` strictly** — explicitly pin allowed signing algorithms (`algorithms: ['HS256']` or `['RS256']`), never accept `alg: none`, and reject tokens verified with missing or default fallback secrets (`process.env.JWT_SECRET || 'dev-secret'` is a critical bug in production).
4. **Enforce object-level authorization (block IDOR) on every endpoint** — authenticate first, then scope every read/update/delete query to the verified principal or tenant (`WHERE id = $1 AND owner_id = $2`). Never trust `userId`, `tenantId`, or `role` from request bodies.
5. **Prevent SQL, NoSQL, and shell injection unconditionally** — always use parameterized queries / prepared statements (`$1`, `?`) or typed ORM query builders; never interpolate user input into SQL strings, `eval`, or `child_process.exec` / `os.system` (use `execFile` / `spawn` with an argument array).
6. **Prevent XSS and unsafe HTML rendering** — rely on framework auto-escaping, never pass untrusted strings to `dangerouslySetInnerHTML`, `v-html`, or `innerHTML` without a strict sanitizer (DOMPurify), and reject `javascript:` URLs in `href`/`src`.
7. **Rate-limit auth endpoints and avoid account enumeration** — enforce strict rate limits on `/login`, `/register`, `/forgot-password`, and OTP verification, and return uniform error messages (`"Invalid email or password"`) without revealing whether an email exists.
8. **Verify the full negative security matrix in tests** — assert: no token → `401`, malformed/expired token → `401`, wrong-user/wrong-tenant resource ID → `403`/`404`, non-admin hitting admin route → `403`, and SQLi/XSS payloads safely escaped or rejected.

## Related skills

- `authentication` — implementing and debugging login, JWT, and session flows.
- `authorization-and-multitenancy` — RBAC/ABAC, Postgres RLS, and tenant isolation.
- `rate-limiting-and-web-security` — CORS, CSP, CSRF, SSRF, and distributed rate limiting.
- `security-review` — code-level security review checklist.
- `env-secrets-management` — keeping JWT secrets and signing keys safe.
