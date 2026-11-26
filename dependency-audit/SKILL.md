---
name: dependency-audit
description: Audit and remediate third-party dependency risks across Node, Python, Java, Go, and Rust — vulnerability scanning, lockfile integrity, license/abandonment checks, transitive overrides, and safe minimal upgrades.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# Dependency Audit

Third-party packages are the largest attack surface and upgrade-breakage source in modern apps. Audit from lockfiles, prioritize reachable production vulnerabilities, and avoid blind `--force` upgrades that break major versions.

1. **Run the ecosystem's native audit tool against the lockfile** — `npm audit` / `pnpm audit` (Node), `pip-audit` or `uv pip check` (Python), `govulncheck ./...` (Go — checks actual call-graph reachability!), `cargo audit` (Rust), or `./mvnw dependency-check:check` / `trivy fs .` (Java/polyglot).
2. **Triage by production reachability and severity first** — separate runtime `dependencies` from `devDependencies` (test/build-only tools), and prioritize Critical/High CVEs in network-facing parsers, auth, crypto, HTTP servers, and serializers.
3. **Never run `npm audit fix --force` blindly** — `--force` silently bumps major versions with breaking API changes. Inspect which direct or transitive package pulls in the vulnerable version (`npm ls <pkg>`, `pnpm why <pkg>`, `mvn dependency:tree`, `go mod why <pkg>`, `cargo tree -i <pkg>`).
4. **Upgrade direct dependencies cleanly before adding overrides** — first try updating the parent package to a patched minor/patch release; use lockfile `overrides` (npm), `pnpm.overrides`, or `resolutions` (yarn) only when an upstream maintainer hasn't released a fix yet, and verify compatibility via tests.
5. **Enforce lockfile integrity and pinned versions in CI** — always commit lockfiles (`package-lock.json`, `pnpm-lock.yaml`, `uv.lock`, `poetry.lock`, `go.sum`, `Cargo.lock` for apps) and use locked installs (`npm ci`, `pnpm install --frozen-lockfile`, `cargo build --locked`) so CI never pulls unreviewed versions.
6. **Prune unused, duplicate, and abandoned dependencies** — remove packages no longer imported anywhere in the repo, eliminate duplicate libraries doing the same job (e.g., `axios` + `got` + `node-fetch`), and check before adding any new dependency that it is actively maintained, properly licensed (MIT/Apache-2.0/BSD vs unexpected GPL/AGPL), and not a typosquat.
7. **Verify the full build and test suite after any dependency update** — run typecheck, unit/integration tests, and production build after bumping or overriding dependencies, and keep dependency bumps in focused commits separate from feature code.

## Related skills

- `dependency-management` — day-to-day dependency addition and upgrade practices.
- `dependency-install-recovery` — fixing broken installs, peer conflicts, and lockfile errors.
- `auth-security-hardening` — application-level security alongside supply-chain hygiene.
- `ci-cd-pipeline` — running locked installs and vulnerability scans in CI.
- `monorepo-management` — aligning shared dependency versions across workspaces.
