---
name: consuming-external-apis
description: Integrate a third-party API correctly — auth, pagination, error handling, rate limits, and the exact request/response contract.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# Consuming External APIs

Integrations fail on contract details. Read the docs' examples, then reproduce them with a real request.

1. **Read the docs' request/response example** — the canonical curl/example IS the contract: URL, method, headers, body, and the exact response shape. Trust it over assumptions.
2. **Auth** — set the exact auth (`Authorization: Bearer <token>`, API key header/query, OAuth). A 401 is almost always auth setup, not the endpoint (see `authentication`).
3. **Pagination** — most APIs paginate. Handle `next`/`page`/`cursor`/`limit` — don't assume one call returns everything. Loop pages until exhausted.
4. **Error handling** — read the API's error format (`{"error":{"message":"..."}}`, `detail`, `errors[]`). Surface the API's message to the caller; never swallow it. Distinguish retryable (429/5xx/network) from fatal (400/401/404).
5. **Rate limits** — respect `Retry-After`/`X-RateLimit-*` headers; back off on 429, don't hammer.
6. **Timeouts + idempotency** — set a timeout on every call (a hung external call hangs your app); for POSTs that mutate, use the API's idempotency key when available.
7. **Verify with a REAL request first** — `curl` the endpoint with the real token and payload (see `http-api-testing`) BEFORE wiring the code; the curl output tells you the true contract.
8. Only `done()` when a live call succeeds end-to-end and the code handles its errors.
