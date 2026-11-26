---
name: rate-limiting-and-web-security
description: Harden web apps and APIs against abuse and browser attacks — distributed rate limiting, Retry-After headers, CORS preflight and credentials traps, CSP, CSRF/SameSite cookies, security headers, and reverse-proxy IP trust.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# Rate Limiting and Web Security

Most web security misconfigurations happen at the HTTP boundary: wildcard CORS with credentials, rate limiters keyed on spoofable headers, or missing cookie flags. Configure them deliberately and verify the actual HTTP headers.

1. **Rate-limit by the right key and store state in Redis for multi-instance apps** — in-memory rate limiters reset on deploy and divide your limit across N replicas. Use a shared store (Redis sliding-window or token-bucket) with separate tiers: strict limits on auth/OTP/password-reset endpoints (by IP + account identifier), moderate limits on write/expensive endpoints (by authenticated `user_id`/`tenant_id`), and broader limits on public reads.
2. **Return standard `429 Too Many Requests` metadata** — include `Retry-After` (seconds) and `RateLimit-Limit` / `RateLimit-Remaining` / `RateLimit-Reset` headers so well-behaved clients back off cleanly instead of hammering in a tight loop.
3. **Never trust raw `X-Forwarded-For` without configuring trusted proxies** — any client can spoof `X-Forwarded-For: 1.2.3.4` to bypass IP rate limits unless your server strips untrusted hops (`app.set('trust proxy', 1)` in Express, or reading the rightmost proxy-appended IP / Cloudflare `CF-Connecting-IP`).
4. **Fix CORS properly — never reflect arbitrary `Origin` with credentials** — `Access-Control-Allow-Origin: *` is rejected by browsers when `Access-Control-Allow-Credentials: true` is set, and dynamically reflecting `req.headers.origin` without an exact allowlist lets any malicious site make authenticated requests as your user. Handle `OPTIONS` preflight cleanly and include `Vary: Origin`.
5. **Lock down session cookies with `HttpOnly`, `Secure`, and `SameSite`** — `HttpOnly` blocks JS theft via XSS, `Secure` restricts cookies to HTTPS, and `SameSite=Lax` (or `Strict`) blocks most CSRF. If your app uses cookie-based auth with cross-site requests or supports older forms, enforce CSRF tokens or require a custom header/JSON content-type checked on state-changing routes.
6. **Ship strict security headers by default** — set `Strict-Transport-Security` (HSTS), `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`, and `Content-Security-Policy` (`frame-ancestors 'none'` to prevent clickjacking, plus `script-src` without `unsafe-inline`/`unsafe-eval` where feasible — use nonces/hashes). Roll out strict CSP in `Content-Security-Policy-Report-Only` first to catch breakages.
7. **Defend against SSRF on any server-side URL fetch** — when fetching user-supplied URLs (link previews, webhooks, imports), restrict protocol to `https:`/`http:`, resolve DNS first, and block private/loopback/link-local IP ranges (`127.0.0.0/8`, `10.0.0.0/8`, `169.254.169.254`, `::1`, `fc00::/7`) — and re-check after HTTP redirects.
8. **Prevent timing attacks and account enumeration** — use constant-time comparison (`crypto.timingSafeEqual`) for secrets, HMACs, and API keys, and return uniform error messages and response timing on login/password-reset flows.
9. **Bound request payloads and parser complexity** — enforce JSON/form body size limits, regex timeout/non-backtracking patterns (avoid ReDoS), and file upload limits before expensive processing runs.
10. **Verify headers and limits with `curl`, not assumptions** — inspect `curl -i` output for security headers, send an `OPTIONS` preflight with a disallowed `Origin` to confirm rejection, and burst a rate-limited route to verify `429` + `Retry-After`.

## Related skills

- `security-review` — code-level vulnerability checklist.
- `authentication` — session, JWT, and login flow correctness.
- `authorization-and-multitenancy` — object-level and tenant access control.
- `input-validation` — schema validation and sanitization at boundaries.
- `caching-strategies` — Redis setup and shared state considerations.
