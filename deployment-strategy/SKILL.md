---
name: deployment-strategy
description: Choose where and how to deploy — static/SSG host vs serverless vs container/PaaS vs VM vs Kubernetes vs edge vs app store vs desktop, matched to the app's real run contract, plus env parity, blue-green/canary/rolling/recreate rollout, rollback, and a pre-deploy runbook.
allowed-tools: Read, Grep, Glob, Bash
---

# Deployment Strategy

Pick the deployment target from what the app actually requires at runtime, not from what is fashionable.

1. **Write down the run contract before choosing a host** — answer six questions and the target picks itself: Does it need a long-lived process (in-memory cache, cron thread, WebSocket fan-out)? Does it need a persistent disk (uploads, SQLite file)? Does it hold state in memory across requests? Can it tolerate cold starts of 1-10s? Does it need a private network to a DB? Does it need a fixed egress IP for a third-party allowlist? Any "yes" eliminates every serverless option for that component.
2. **Map the contract to a family** — pure static/SSG output → any static host or CDN; request-scoped API with no long-lived state → serverless/edge; long-lived process, WebSockets, background workers, or a bundled DB → container/PaaS/VM/K8s; a real binary the user installs → app store or desktop distribution. A full-stack app is frequently TWO targets (static frontend + API) — deploy them separately rather than cramming both into one platform's limits.
3. **Size the operational budget** — a solo project with no ops time belongs on a PaaS (Railway/Render/Fly.io/Heroku) or a managed container runtime; a team that already runs a cluster belongs on Kubernetes. Do not choose K8s for a hobby app: the control plane, ingress, cert-manager, and secrets story is a second product to operate.
4. **Separate the environments and make them parity-checked** — dev, staging, prod must share the same start command, the same env var NAMES (different values), and a real staging deploy that sees production-shaped data. A prod-only failure is almost always an env var present in dev and missing in prod, or a build-time variable baked in at build instead of resolved at runtime (see `configuration-loading`).
5. **Pick the rollout shape by blast radius** — **recreate** (downtime, simplest, fine for staging), **rolling** (default for stateless HTTP; needs a readiness probe or traffic hits cold pods), **blue-green** (instant cutover and instant rollback, double cost during swap — the right call when migrations are involved), **canary** (5% of real traffic, requires per-version metrics and a decision point). Write the rollback command BEFORE the first deploy: `kubectl rollout undo`, `vercel rollback`, `fly releases`/`fly deploy --image <previous>`, `heroku releases:rollback`, or re-pointing a DNS weight.
6. **Treat migrations as a deploy-coupled, forward-only step** — expand/contract: ship the additive schema change, deploy code that reads both shapes, backfill, then drop the old column in a later deploy. A migration that cannot run twice without error will fail a blue-green swap; make it idempotent (see `database-migration`).
7. **Run the pre-deploy runbook, in order** — build artifact identity recorded (git SHA/tag + image digest) → all required env vars defined for the target environment → migrations run against that environment's DB → health check path returns 200 → rollback path known and tested → smoke test defined. Deploying without the artifact identity makes "what is in prod" unanswerable and rollback guesswork.
8. **Named failure modes and their fixes** — *"works locally, 502 in prod"* → the platform is routing to a port the app is not listening on (many inject `$PORT`/`WEBSITES_PORT`); bind `0.0.0.0`, not `127.0.0.1`. *File uploads vanish after a redeploy* → ephemeral filesystem; move to object storage. *App boots then dies* → read the runtime log, not the build log (`startup-failure-recovery`). *Deploy green but 404* → wrong build output directory / base path.
9. **Verify the deployed artifact, not the deploy log** — a green deploy pipeline has shipped many broken sites. Follow `deployment-verification` every time: hit the public URL from outside, assert a version marker, run the critical flow, watch logs for the first minutes. Then hand ownership to `production-process`/`observability` for staying up.

## Related skills

- `vercel-deployment` — Vercel builds, previews, and function limits.
- `netlify-cloudflare-deployment` — Netlify, Cloudflare Pages/Workers, and generic static-host gotchas.
- `kubernetes-deployment` — Deployments, probes, rollouts, and pod-level debugging.
- `aws-deployment` — ECS/Beanstalk/Lambda/S3+CloudFront/EC2 primitives and IAM.
- `gcp-azure-deployment` — Cloud Run, App Engine, App Service, and Container Apps.
- `paas-deployment` — Railway, Render, Fly.io, Heroku, DigitalOcean App Platform.
- `serverless-edge-deployment` — Workers, Deno Deploy, Lambda, and DB connection pooling from ephemeral runtimes.
- `deployment-verification` — proving the deployed thing actually serves the new build.
- `docker-container` — the image that most of these targets consume.
- `ci-cd-troubleshooting` — when the pipeline, not the app, is broken.

───
