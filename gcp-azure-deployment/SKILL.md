---
name: gcp-azure-deployment
description: Deploy on GCP and Azure — Cloud Run gcloud run deploy with the $PORT contract, min/max instances and concurrency, App Engine app.yaml, Cloud Build; Azure App Service az webapp with WEBSITES_PORT and startup-command, Container Apps ingress, deployment slots and swap for blue-green, and pipeline wiring.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# GCP & Azure Deployment

Cloud Run and App Service are managed container runtimes: they inject a port and a lifecycle, and they fail quietly when the contract is not met.

1. **Cloud Run owns the port — read `$PORT`** — Cloud Run injects `PORT` (default 8080) and refuses to start if nothing listens on it. Bind `0.0.0.0:$PORT` (Node `listen(process.env.PORT || 8080)`, Python `uvicorn --host 0.0.0.0 --port $PORT`). Binding a hardcoded 3000 gives a container that builds fine and never becomes ready.
2. **Deploy Cloud Run with limits chosen deliberately** — `gcloud run deploy <svc> --source . --region <r> --allow-unauthenticated --min-instances=1 --max-instances=10 --concurrency=80 --memory=512Mi --set-env-vars=K=V --set-secrets=DB_URL=db-url:latest`. `--min-instances=0` means a cold start on the first request (seconds of latency and a fresh in-memory cache); `--concurrency` higher than the app can handle manifests as 429/5xx under load. Use `--source .` (Cloud Build + a generated image, requires a Dockerfile or buildpacks) or `--image <AR path>` for a pre-built artifact.
3. **Provision the backing services in the same VPC/connector** — Cloud SQL needs `--add-cloudsql-instances` (or an auth proxy sidecar) and the app must connect over the socket/connector path, not `localhost`. A connection refused from Cloud Run with the DB healthy on-prem is a missing connector or an authorised-network gap.
4. **App Engine is `app.yaml`-driven** — `runtime: nodejs20`, `entrypoint: npm start`, `env_variables`, `automatic_scaling: {min_instances, max_instances}`; deploy with `gcloud app deploy app.yaml --project <p>`. Standard-environment instances are stateless with an ephemeral `/tmp` — uploads and local SQLite do not survive. `gcloud app logs tail -s default` is the log path.
5. **Cloud Build or GitHub Actions does the repeatable path** — `cloudbuild.yaml` with `steps: [gcloud builds submit / docker build / gcloud run deploy]`; keep the deploy identity as a service account with `roles/run.developer` + `roles/iam.serviceAccountUser`, not the owner. Authenticate CI with workload identity federation rather than a downloaded JSON key.
6. **Azure App Service: the port and start command are explicit settings** — a custom container needs `WEBSITES_PORT` set to the port it listens on (`az webapp config appsettings set -g <rg> -n <app> --settings WEBSITES_PORT=8080`), and `az webapp config set --startup-file "npm start"` for a non-Docker build. Default behaviour: the platform probes for a listener, and if it never finds one the app returns 502 while the container is actually running fine on another port.
7. **Deploy the App Service code path with the right artifact** — `az webapp deployment source config-zip -g <rg> -n <app> --src app.zip` (zip deploy) or `az webapp up -g <rg> -n <app>` for a quick push. Set the runtime first (`az webapp config set --linux-fx-version "NODE|20-lts"`); a mismatched stack manifest leaves the app on "waiting for content to be pushed".
8. **Blue-green on Azure is a deployment slot swap** — `az webapp deployment slot create --slot staging`, deploy to `staging`, warm it, then `az webapp deployment slot swap --slot staging --target-slot production`. Swap is atomic and near-instant; the rollback is swapping back. **Slot settings** marked sticky stay with the slot while non-sticky app settings swap with the code — a connection string that follows the code is the classic swap surprise.
9. **Container Apps is the Azure answer to Cloud Run** — `az containerapp up --name <app> --resource-group <rg> --source .` with `--target-port` set to the container's listening port and `--ingress external`. Revisions give revision-based traffic splitting (`--revision-suffix`, traffic weights) for canary; without `--target-port` matching, ingress 502s.
10. **Verify from the public URL in both clouds** — the deploy command prints the service URL; `curl -sS -o /dev/null -w '%{http_code}\n' <url>/health` and the real API path must be 200, from outside the project/subscription. Confirm the running revision/image is the one you just built (`gcloud run services describe --format='value(status.latestReadyRevisionName)'`, `az webapp deployment slot list`), then run `deployment-verification`.

## Related skills

- `deployment-strategy` — choosing Cloud Run/App Service and rollout shape.
- `deployment-verification` — proving the deployed revision serves.
- `docker-container` — the image both runtimes execute.
- `configuration-loading` — PORT/env-var contract and per-environment settings.
- `ci-cd-troubleshooting` — when Cloud Build or the pipeline fails.
- `secret-management` — Secret Manager / Key Vault instead of env-var literals.

───
