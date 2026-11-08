---
name: deployment-verification
description: Prove a deploy actually served the new build — hit the public/health URL, assert a version or commit marker, purge/bypass the CDN and check Cache-Control, run the critical user flow from outside, watch logs and error rate for the first minutes, confirm env vars resolved and migrations ran, and record the rollback command; includes a copy-paste smoke-test checklist for every platform.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# Deployment Verification

A green deploy log proves the pipeline ran — not that the new build is what the world is being served.

1. **Assert the version marker, not the status code** — a 200 from the CDN can be a cached page from last week. Expose an identity you can compare: `GET /health` returning `{"status":"ok","version":"<git sha>","commit":"<short sha>"}` or a build hash in the HTML/`/version` endpoint. Compare it to the artifact you just deployed; a mismatch is a stale cache or a wrong environment, and you stop there.
2. **Bypass every cache layer on the first probe** — `curl -sS -H 'Cache-Control: no-cache' 'https://<domain>/health'` and `curl -sS 'https://<domain>/health?cb=$(date +%s)'`, then check what the CDN declares: `curl -sSI https://<domain>/` and read `cache-control`, `age`, `x-cache`/`cf-cache-status`. `age` > 0 with an old version means the edge is serving the previous build — purge it (CloudFront invalidation, Cloudflare purge, Vercel redeploy) and re-probe. Static assets should be fingerprinted with a long TTL; HTML should be `no-cache`.
3. **Prove the process is the NEW code, not a warm old one** — platform rollouts briefly serve both versions. Confirm the running revision/instances restarted (`kubectl rollout status`, `gcloud run services describe`, `aws ecs describe-services --services <s> --query 'services[0].deployments'`, `fly status`, `vercel ls`) and that the instance started AFTER your deploy timestamp.
4. **Run the critical user flow from OUTSIDE the network** — the one path that makes the product work: load the page, log in, create the object, read it back, receive the right response. Use `curl` for API flows and a real browser for anything user-facing. This is the step that catches CORS, cookie `SameSite`, redirect loops, and a frontend pointed at the wrong API base — none of which a health check sees.
5. **Confirm configuration actually resolved** — a config-driven 500 is the most common post-deploy failure: the env var exists in staging and not in production, or a build-time variable was baked in at build with the dev value. Check the deploy log/app boot log for explicit "missing required env" validation, and probe an endpoint that touches each external dependency (DB, cache, third-party API) rather than only the ones with no dependencies.
6. **Confirm the schema matches the code** — the deployed revision expects a column/table the migration did not add, or runs against a DB that never got migrated. Verify with a real read/write against the deployed environment (`SELECT` on the new column, or call the endpoint that uses it) and confirm the migration ran as an ordered deploy step with its own log line — not inside an app start that raced another replica.
7. **Watch logs and error rate for the first minutes** — the deploy is not over at the first 200. Tail the platform log (`vercel logs <url>`, `fly logs`, `heroku logs --tail`, `aws logs tail /ecs/<svc> --follow`, `kubectl logs -f deploy/<name>`, `wrangler tail`) and look for a burst of 5xx, timeouts, or reconnects. A deploy that spikes errors is rolled back, not watched.
8. **Know and record the rollback command before you need it** — write it into the deploy record: `kubectl rollout undo deployment/<name>`, `helm rollback <release> <rev>`, `vercel rollback <url>`, `fly deploy --image <previous>`, `heroku releases:rollback`, `aws ecs update-service --task-definition <previous-rev>`, `az webapp deployment slot swap --slot staging`. Rollback is only real if it has been executed once in staging.
9. **Copy-paste smoke-test checklist — applies to every platform:**
   - `curl -sS -o /dev/null -w '%{http_code}\n' https://<domain>/` → 200
   - `curl -sS 'https://<domain>/health?cb=$(date +%s)'` → `status ok` + version matching the deployed SHA
   - `curl -sSI https://<domain>/` → `cache-control` sane, `age` low
   - deep link on a client-routed page → 200, not 404
   - the real API call the UI makes → expected status AND expected body shape
   - the write path (POST/PUT) → returns the created object, and re-reading it returns it
   - auth path → login succeeds, and an unauthenticated request is rejected with 401 (not 500)
   - log tail for 2-5 minutes → no 5xx burst, no "missing env var", no restart loop
   - rollback command recorded and known to run in under a minute

10. **Sign off only on evidence you captured this run** — paste the actual responses (status, version, body) into the report. When the deploy turns out to be bad, switch modes: this skill proves, `incident-response` contains and recovers. For the generic prove-it-runs method underneath, use `runtime-verification`; for the HTTP mechanics, `http-api-testing`; for a browser-driven flow, `browser-verification`.

## Related skills

- `deployment-strategy` — the runbook this verification closes out.
- `vercel-deployment` / `netlify-cloudflare-deployment` — cache/marker mechanics on those hosts.
- `kubernetes-deployment` / `aws-deployment` / `gcp-azure-deployment` / `paas-deployment` / `serverless-edge-deployment` — the platform-specific verification hooks.
- `runtime-verification` — the general "prove the running app works" method.
- `http-api-testing` — request/status/body assertions with curl.
- `incident-response` — what to do when verification fails in production.

───
