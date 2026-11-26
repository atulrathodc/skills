---
name: ci-cd-pipelines
description: Author fast, secure, maintainable CI/CD pipelines (GitHub Actions, GitLab CI) — dependency and build caching, concurrency cancellation, least-privilege OIDC auth, pinned action SHAs, matrix builds, and artifact promotion.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# CI/CD Pipelines

A slow or insecure CI pipeline drags down every commit. Design workflows so PR feedback lands in minutes, builds are reproducible, and cloud deployments never rely on long-lived static credentials.

1. **Enforce least-privilege `permissions` on every workflow** — set `permissions: contents: read` at the top level and elevate per job only where needed (e.g., `id-token: write` for OIDC, `packages: write` for container push). Never run workflows with default read-write tokens across all scopes.
2. **Use OIDC keyless authentication instead of static cloud secrets** — configure AWS IAM OIDC, GCP Workload Identity Federation, or npm/PyPI Trusted Publishing so CI mints short-lived scoped tokens per run. Static `AWS_ACCESS_KEY_ID` secrets leak, expire unexpectedly, and are painful to rotate.
3. **Cancel redundant in-flight PR runs with `concurrency`** — set `concurrency: { group: ${{ github.workflow }}-${{ github.ref }}, cancel-in-progress: true }` on PR/feature branches so pushing a new commit cancels stale runs immediately. Never set `cancel-in-progress: true` on `main` or production deploy workflows (canceling mid-deploy leaves partial state!).
4. **Pin third-party actions to full commit SHAs (with a version comment)** — use `actions/checkout@<40-char-sha> # v4` instead of mutable `@main` or `@v4` tags so an upstream tag compromise cannot execute arbitrary code with access to your repo secrets.
5. **Cache package manager stores and build artifacts properly** — use built-in caching (`actions/setup-node` with `cache: 'pnpm'`, `Swatinem/rust-cache`, `actions/setup-python` with `cache: 'pip'`, Docker Buildx `cache-from/cache-to: type=gha`) keyed on lockfile hashes. Always run locked installs (`npm ci`, `pnpm install --frozen-lockfile`, `uv sync --frozen`, `cargo build --locked`).
6. **Run fast checks in parallel and fail early** — split lint, typecheck, unit tests, and build into parallel jobs (or fail-fast stages) so a 10-second lint error does not wait behind a 5-minute E2E suite.
7. **Build once, promote the exact artifact across environments** — never rebuild from source separately for staging and prod. Build a single immutable container image (pinned by digest `@sha256:...`) or release bundle in CI, verify it in staging, and promote that exact artifact to production.
8. **Guard pull requests from forks against secret exfiltration** — never run `pull_request_target` with checkout of untrusted PR code; untrusted PRs must run under standard `pull_request` where secrets are withheld and tokens are read-only.
9. **Protect production deploys with environment gates and required checks** — use GitHub Environments (branch restrictions + optional manual reviewers + environment-scoped secrets) and require CI status checks before merging to `main`.
10. **Validate workflow syntax and keep logic testable locally** — move non-trivial bash logic (>10 lines) out of inline YAML into versioned scripts (`scripts/ci-*.sh` with `set -euo pipefail`) so they can be linted (`shellcheck`) and run locally without push-and-pray cycles.

## Related skills

- `ci-cd-troubleshooting` — diagnosing and fixing broken pipeline runs.
- `deployment-strategy` — rollout shapes, env parity, and rollback commands.
- `deployment-verification` — post-deploy smoke checks after CD completes.
- `monorepo-management` — affected-only CI filtering in multi-package repos.
- `secret-management` — managing CI secrets and credential rotation.
