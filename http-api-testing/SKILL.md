---
name: http-api-testing
description: Verify a running HTTP API with curl — method, path, status, headers, JSON payload, and the exact request that triggers a bug.
allowed-tools: Bash, Read, Grep
---

# HTTP API Testing

A running app is only proven by hitting its endpoints. Verify with `curl`, never by reading code alone.

1. **Start the app first** (see `make-it-run`), then test against the real server.
2. **Craft the exact request:**
   - `curl -s -i http://localhost:<port>/<path>` — status + headers + body.
   - `-X POST` / `-d '{"key":"value"}'` — send a JSON body (set `-H "Content-Type: application/json"`).
   - `-H "Authorization: Bearer <token>"` — auth headers.
3. **Check the status code** — 200/201 success, 4xx is the CLIENT contract being wrong, 5xx is the SERVER.
4. **Validate the JSON payload** — pipe to `jq` (`curl -s ... | jq .field`) or `python3 -m json.tool`. Confirm the exact fields the frontend/consumer expects.
5. **Reproduce a reported bug** — use the request from the bug report (same path, method, body, headers) and capture the ACTUAL response. The diff between expected and actual IS the bug.
6. After a fix, re-run the SAME curl — a fix is not real until the endpoint returns the corrected response.
