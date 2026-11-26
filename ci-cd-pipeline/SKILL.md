---
name: ci-cd-pipeline
description: Build and harden CI/CD pipelines for coding projects — fast parallel lint/typecheck/test/build stages, dependency caching, least-privilege permissions, OIDC keyless deploys, pinned action SHAs, and zero leaked secrets.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# CI/CD Pipeline

Design every pipeline so PRs get fast, deterministic feedback, builds are reproducible from lockfiles, and deployments never depend on long-lived static tokens.

1. **Enforce least-privilege `permissions` on every workflow** — set `permissions: contents: read` at the workflow root and elevate only the specific job that needs `id-token: write` (OIDC) or `packages: write`. Never leave default read-write tokens active across untrusted steps.
2. **Use locked installs and lockfile-keyed caching** — run `npm ci`, `pnpm install --frozen-lockfile`, `uv sync --frozen`, `pip install -r requirements.txt`, `mvn -B -ntp verify`, or `go test -race ./...` with official setup caching (`actions/setup-node`, `actions/setup-python`, `actions/setup-java`, `actions/setup-go`).
3. **Run fast gates in parallel and fail early** — separate lint/format, typecheck, unit tests, and build/Docker verification into parallel jobs so a 10-second lint or type error fails immediately instead of waiting behind slow integration/E2E jobs.
4. **Cancel stale PR runs, never production deploys** — set `concurrency: { group: ${{ github.workflow }}-${{ github.ref }}, cancel-in-progress: true }` on PR checks, and `cancel-in-progress: false` on `main` / deploy workflows so deployments never abort mid-rollout.
5. **Pin third-party actions to full commit SHAs and guard fork PRs** — pin external actions (`owner/action@<40-char-sha> # vX`) to block supply-chain tag hijacking, and never combine `pull_request_target` with checking out untrusted PR code.
6. **Use OIDC keyless auth and Environment protection rules for deploys** — prefer OIDC (`id-token: write`) over static cloud/registry keys, scope production secrets to a protected GitHub Environment, and never echo secrets into logs or artifacts.
7. **Build once and promote the verified artifact** — tag images by git SHA/digest, smoke-test the built artifact, and promote that exact image across staging → production rather than rebuilding from source.
8. **Keep complex logic in testable shell scripts** — move multi-line bash blocks into `scripts/ci/*.sh` (`set -euo pipefail`) so they can be run locally and checked with `shellcheck` before pushing.

## Related skills

- `ci-cd-troubleshooting` — diagnosing failing pipeline logs and flaky CI runs.
- `env-secrets-management` — managing CI/CD secrets and preventing token leaks.
- `docker-multistage-hardening` — building and caching hardened container images in CI.
- `deployment-verification` — post-deploy verification after CD completes.
