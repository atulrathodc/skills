---
name: paas-deployment
description: Deploy to one-command PaaS hosts — Fly.io fly.toml and fly launch/deploy, Railway, Render, Heroku Procfile and dynos, DigitalOcean App Platform; buildpack vs Dockerfile detection, the injected PORT contract, ephemeral disk that eats uploads and SQLite, free-tier sleep and cold starts, release-phase migrations, and health checks.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# PaaS Deployment

A PaaS runs your build on its own terms — the build pack, the port, and the disk are all the platform's contract, not yours.

1. **Let the platform detect the build, then verify what it detected** — with a `Dockerfile` present, most platforms build the image and ignore buildpacks; without one they use a buildpack that infers the language from the manifest. The inferred START command is the usual failure (`npm start` missing in `package.json`, or a start script that expects a dev-only dependency). Declare it explicitly rather than relying on inference.
2. **Honour the injected `PORT`** — Railway, Render, Heroku, and Fly set `PORT` (or expect the port declared in `fly.toml`'s `internal_port`). The app must listen on `process.env.PORT` / `$PORT` and bind `0.0.0.0`. A hardcoded 3000 is the reason a container that ran locally reports "no open ports detected" or health-checks red.
3. **Fly.io: `fly.toml` is the deploy spec** — `fly launch --no-deploy` generates it; set `[http_service] internal_port = 8080`, `auto_stop_machines`/`min_machines_running`, and `[mounts] source = "data" destination = "/data"` for a volume. `fly deploy`, then `fly status` (machines + health checks) and `fly logs`. `fly secrets set KEY=value` for env vars; `fly releases` + `fly deploy --image <previous image>` is your rollback. Volumes are per-region and pin the machine — a multi-region app cannot share one volume.
4. **Heroku: Procfile, dynos, and a filesystem that forgets** — `web: node server.js` and `release: npx prisma migrate deploy` (the `release` phase runs once per deploy, before the new dynos take traffic — the correct place for migrations; a `postinstall` migration runs per dyno and races). `heroku config:set KEY=value`, `heroku ps:scale web=1`, `heroku logs --tail --app <app>`. The dyno filesystem is ephemeral and is wiped on every restart (which happens daily): uploaded files and a local SQLite file disappear — use S3-compatible object storage and a managed Postgres.
5. **Railway / Render / DigitalOcean App Platform: check the service settings, not the repo** — the service holds the build command, start command, root directory, health-check path, and env vars per environment. A monorepo needs the root directory set or the build runs from the wrong folder. Render distinguishes a Web Service (HTTP, health checks) from a Background Worker (no port) — putting a worker behind a port or an HTTP app without one produces "no open ports detected". Migrations belong in the platform's pre-deploy/release command.
6. **Free tiers sleep — treat cold start as a product decision** — free web services spin down after inactivity, so the first request takes 10-30s and can time out for a real user or an uptime monitor. Either pay for an always-on instance or keep it warm deliberately; never benchmark or load-test a free tier and conclude the app is slow.
7. **Scaling out breaks in-memory state** — with more than one instance, sessions, in-process caches, rate-limit counters, and scheduled jobs all run per instance. Move sessions to a shared store, jobs to a single scheduler/worker, and never assume "the same process handles the follow-up request".
8. **Name the failure and its fix** — *build succeeds, app crashes on boot* → read the runtime log, usually a missing env var or a `devDependency` used in the start script (`npm ci --omit=dev` removed it). *Works, then all writes vanish* → ephemeral disk. *Health check failing but the app runs* → the health path returns non-200 (auth or 404) or the platform probes a different port than the app binds.
9. **Verify the public URL, then a second request** — `curl -sS -o /dev/null -w '%{http_code} %{time_total}s\n' https://<app>.fly.dev/health` (note the time: a sleeping instance shows it), a second request to confirm it stayed up, and the real API path. A successful `fly deploy`/`git push heroku` only proves the build was accepted. Then run `deployment-verification`.

## Related skills

- `deployment-strategy` — choosing a PaaS and the rollout/rollback plan.
- `deployment-verification` — proving the deployed instance serves.
- `docker-container` — when the PaaS consumes your Dockerfile instead of a buildpack.
- `production-process` — process supervision semantics these platforms replace.
- `database-migration` — the migration that belongs in the release phase.
- `background-jobs` — moving cron/queue work off the web instance.

───
