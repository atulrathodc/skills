---
name: serverless-edge-deployment
description: Deploy on-demand functions — AWS Lambda/API Gateway, Cloudflare Workers, Deno Deploy, Vercel Edge, Netlify Edge, Supabase/Neon-backed functions; cold starts and their real causes, init code outside the handler, database connection pooling from ephemeral runtimes (per-request pool, HTTP drivers like Neon, Supabase pooler, RDS Proxy), statelessness, execution time limits, and local-emulate vs deployed parity.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# Serverless & Edge Deployment

Serverless runs your function in a fresh, disposable sandbox per invocation — every assumption about memory, disk, and connections is a bug waiting for traffic.

1. **Write the function as a pure request→response transform** — no global mutable state, no writes to `/tmp` you later read, no in-process cron. Anything outside the handler still runs on EVERY cold start but only survives while the instance is warm, so a "cache" that works in a warm loop silently misses in production.
2. **Cold starts are caused by init cost, not by the platform being slow** — the measured time is bundle size + dependency weight + module-scope work. Import lazily inside the handler, strip large SDKs (a full `aws-sdk` import for one call costs hundreds of ms), and keep the package small. V8 isolates (Workers, Deno Deploy, Edge runtimes) start in milliseconds but have no Node APIs and a small size cap; container-based runtimes (Lambda, Cloud Run) are heavier but give you a real filesystem and native modules. Choose by what the code needs, not by benchmark folklore.
3. **A relational DB plus a serverless runtime equals connection exhaustion** — every concurrent invocation that opens a `pg`/`mysql2` pool opens its own connections, and the DB's `max_connections` (often ~100) is hit at a concurrency you will reach easily. Fix in this order of preference: an HTTP-based driver that goes through the provider's pooler (Neon HTTP/serverless driver, Supabase pooler port 6543 in transaction mode), a managed proxy (RDS Proxy), or a small per-invocation pool with a hard `max` — never a module-scope pool sized for a long-lived server, because you get N instances each holding their own.
4. **Transaction-mode pooling forbids prepared statements and session state** — PgBouncer-style poolers reuse a connection across clients, so a named prepared statement, an advisory lock, `SET`, or a long explicit transaction spans the wrong connection. With `pg`, disable statement names (`statement_cache_size: 0`) or use `queryMode: 'simple'`; with an ORM, use its serverless/edge profile.
5. **Respect the execution limits and the failure they cause** — a hard wall-clock timeout (Lambda `Timeout`, Workers CPU time, Vercel function duration) kills the invocation mid-flight with no stack trace in your logs. Long report generation, PDF rendering, big uploads, and batch jobs belong on a queue + worker, not in a request handler. Streaming (SSE/`ReadableStream`) is the tool for anything slow but ongoing.
6. **Locally emulated is not deployed** — mirrors are approximate: `wrangler dev` uses Miniflare (not production's isolate), `sam local`/`serverless invoke local` differ in Node version and env, and Deno Deploy runs a different runtime than `deno run` in some permissions. Always deploy one probe invocation to the real environment early — before building the whole feature — so runtime differences surface once, cheaply.
7. **Configuration and secrets are per-environment and not in the bundle** — Workers: `wrangler secret put NAME` and `[vars]` in `wrangler.jsonc`; Lambda: env vars in the function config or Secrets Manager fetched at init (cache the fetch for the warm lifetime, but handle the cold path); API Gateway passes the method/path in `event`, and a 403 in front of a healthy Lambda is a route/resource-policy problem, not your code.
8. **Match the route before debugging the function** — for API Gateway a 403 usually means no resource/method or a missing Lambda permission (`aws lambda add-permission`), a 502 means the response shape is not what API Gateway expects or the function threw, and a 504 means the integration timeout was hit. Invoke the function directly (`aws lambda invoke --function-name <fn> --payload '{"path":"/health"}' out.json`) to separate function bugs from route bugs.
9. **Verify the deployed endpoint returns the expected BODY, not just a 200** — `curl -sS -w '\n%{http_code}\n' https://<fn-endpoint>/<route>` and assert the payload (a version field, real data). Then check the platform log group for the invocation to confirm it ran the code you just deployed — a warm container can still serve the previous version for a moment. Continue with `deployment-verification`.

## Related skills

- `deployment-strategy` — when serverless/edge is the wrong answer entirely.
- `deployment-verification` — proving the deployed function serves.
- `aws-deployment` — Lambda packaging, IAM, and CloudWatch specifics.
- `netlify-cloudflare-deployment` — Workers/Pages project configuration and bindings.
- `background-jobs` — moving long work out of a request handler.
- `caching-strategies` — caching correctly when there is no warm process.

───
