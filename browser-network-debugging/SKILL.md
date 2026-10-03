---
name: browser-network-debugging
description: Debug browser request failures — CORS and preflight, cookies/credentials/SameSite, 401/403 auth, 404 asset paths and SPA rewrites, 500s, redirects, cache and service-worker staleness, mixed content, CSP, and WebSocket/SSE. A request that works in curl can still fail in the browser; this is why.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write, browser
---

# Browser Network Debugging

The browser enforces rules `curl` does not: same-origin, CORS, credentials, mixed content, CSP, and caching.
So **"it works in curl" is not evidence the browser request works** — and `curl` skipping the browser's checks is
exactly why a CORS bug survives local API testing.

## Read the request before reading the code

1. **Start from the network log, not the source** — capture the actual request: method, full URL, status, request headers, response headers, and response body. The failing fact is in there; the component's `fetch` call in the editor is a guess about it.
2. **Classify by status — the layer that failed tells you where to look:**
   - **200 but wrong body** → the contract/shape is wrong, not the transport (see `http-api-testing`).
   - **4xx** → the CLIENT contract is wrong: bad URL, bad payload, missing/expired auth, or a server-side validation rule.
   - **5xx** → the SERVER threw; the fix is in the backend, and the response body/log has the trace.
   - **`(failed)` / status 0 / `net::ERR_*`** → the request never got a response: CORS, DNS, refused connection, blocked by the browser (mixed content, CSP, ad blocker), or offline.
3. **A CORS error is a server bug reported by the browser** — the browser blocks the *response* after the server already handled the request. The server must send `Access-Control-Allow-Origin` (and friends); the frontend cannot fix it, and no `fetch` option will. Note the request may appear in the network log with a successful status while the browser still rejects it.
4. **Know why a preflight fires** — a non-simple request (any method beyond GET/HEAD/POST, a `Content-Type` other than `application/x-www-form-urlencoded`/`multipart/form-data`/`text/plain`, or any custom header such as `Authorization`) triggers an `OPTIONS` preflight first. The `OPTIONS` must answer `204`/`200` with `Access-Control-Allow-Methods` and `Access-Control-Allow-Headers` echoing what you send — listing `GET,POST` while sending `Authorization` fails the preflight with a confusing "no ACAO header" error.
5. **Credentials are a two-sided opt-in** — sending cookies cross-origin needs `fetch(url, { credentials: 'include' })` **and** `Access-Control-Allow-Credentials: true` on the server, and with credentials the server's `Access-Control-Allow-Origin` **cannot** be `*` — it must echo the exact origin. `axios` needs `withCredentials: true`. Missing either half drops the cookie silently and the request arrives unauthenticated.
6. **`SameSite` is why the cookie works locally and not cross-site** — `SameSite=Lax` (the modern default) does not send the cookie on cross-site `fetch`/`POST`, and `SameSite=None` requires `Secure`, which requires HTTPS. `localhost` is treated as secure, so a login that works locally can fail on a real cross-site deployment with no code change.

## Auth, paths, and redirects

7. **Separate 401 from 403** — `401` means no valid credentials reached the server (missing/expired token, cookie dropped by §5–6); `403` means the credentials were understood and refused (wrong role, wrong tenant, CSRF check). They have different fixes; treating them as "auth is broken" wastes the run.
8. **Watch for the refresh loop** — an expired token that triggers a refresh which also 401s produces an unbounded retry, or a redirect to `/login` that itself requires auth. Check for a repeating request in the network log; that pattern is the bug, not the original 401.
9. **404s on assets are path bugs, not missing files** — check the requested URL against where the file actually lives: a wrong base path (`/assets/` vs `/app/assets/`), a missing trailing slash, a hash that does not match the built filename, or a case-sensitivity difference that only bites on Linux. Confirm with `curl -I <the exact URL from the log>`.
10. **A 404 on refresh of a nested route is a missing SPA rewrite** — client-side navigation works because the router handles it in JS, but a hard refresh asks the *server* for `/settings/profile`, which does not exist as a file. The fix is a catch-all rewrite (`try_files $uri /index.html` in nginx, `"rewrites"` in Vercel/Netlify, a `/*` fallback), not a frontend change.
11. **Read the response body on a 500** — frameworks often return a JSON error or an HTML stack trace that names the exception. Logging only `"request failed"` and the status throws away the whole diagnosis.
12. **Redirects change method and get cached** — a `301`/`308` is cached aggressively by the browser, so a fixed redirect can keep behaving as before until the cache is cleared; a `302`/`303` turns a `POST` into a `GET` on the next hop, which silently drops the body. A loop (A→B→A) shows as `ERR_TOO_MANY_REDIRECTS`.

## Stale bytes: the phantom bug

13. **Suspect cache before code when a fix does not take effect** — a "fixed" bug that persists is usually the browser serving a cached bundle or a cached API response. Hard-reload (bypassing cache), disable cache in devtools, and check whether the response was a `304` or came from the disk/memory cache.
14. **A service worker can serve an old app forever** — it intercepts requests before the network and will keep returning the previous bundle even after a hard reload. Unregister it and clear its caches, then reload; if the bug vanishes, it was staleness, not code.
15. **Read the caching headers to know the intended policy** — `Cache-Control: no-store` for authenticated JSON, a content-hashed filename plus a long `max-age` for static assets. A `200 OK (from disk cache)` on an API call is a bug in the headers, and it looks exactly like the backend returning stale data.
16. **CDN/proxy caches sit in front of the server** — a fix deployed but not purged at the edge still serves the old response. Confirm by requesting the origin directly (bypassing the CDN) and comparing.

## Browser-only blocks

17. **Mixed content is blocked silently** — an `http://` request or asset from an `https://` page is refused by the browser. This is the classic cause of "works locally over http, broken in production over https".
18. **CSP violations look like ordinary failures** — a strict `Content-Security-Policy` blocks inline scripts, `eval`, and off-origin connections, and the console reports the violation with the directive that blocked it. Read that line before changing code.
19. **WebSocket/SSE failures are a scheme and upgrade problem** — use `ws://`/`wss://` (not `http://`) and match the page's scheme (`wss://` from an `https://` page). A `101` that never appears, or a proxy that does not forward the `Upgrade` header, means the connection died at the network layer, not in your message handler (see `websocket-realtime`).
20. **Check encoding and content type** — a `Content-Type` that does not match the body (form-encoded sent as JSON, or vice versa) makes the server parse nothing and fail validation with a misleading error. A JSON parse error in the console on a 200 response means the response was HTML (an error page or a login redirect).

## Read the waterfall

21. **Separate latency from size in the timing panel** — TTFB means the *server* is slow (query, cold start); a long download means the payload is too big; a long queue/blocked time means request serialization or connection limits. These have three different fixes and the status code cannot distinguish them.
22. **Serialized requests are a frontend bug** — a waterfall where request N+1 starts only after N finishes is an `await` chain in a loop that should be parallel (`Promise.all`) or a parent-child fetch that should be flattened.
23. **Fix at the correct layer, then re-verify in the browser** — CORS, cookies, and cache headers are server/proxy fixes; base paths and rewrites are build/server config; only the request construction is frontend. Reproduce the fixed call in `curl` to confirm the transport, then **re-drive it in the browser**, because `curl` does not enforce CORS, credentials, or CSP and will report success on a request the browser still blocks (see `browser-verification`).

## Related skills
- `browser-verification` — the end-to-end proof this layer feeds into.
- `browser-debugging` — classify and fix the non-network browser failures.
- `http-api-testing` — probing the API directly; remember it bypasses every browser rule above.
- `frontend-backend-integration` — wiring the client to the server correctly in the first place.
- `caching-strategies` — designing the `Cache-Control`/CDN policy that step 15–16 diagnoses.
- `websocket-realtime` / `webrtc-realtime` — realtime transports and their upgrade path.
- `authentication` — token/session design behind the 401/403 and cookie behavior.
