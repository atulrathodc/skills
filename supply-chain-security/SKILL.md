---
name: supply-chain-security
description: Secure software supply chains across dependencies, builds, and containers — CVE/SBOM generation (CycloneDX/SPDX), lockfile integrity, install-script and typosquat defense, pinned SHAs/digests, provenance, and safe upgrades.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# Supply-Chain Security

Modern apps ship 80%+ third-party code. A compromised transitive package, mutable GitHub Action tag, or malicious `postinstall` script runs with full access to your CI secrets and production data.

1. **Enforce strict lockfile integrity in local dev and CI** — commit lockfiles (`pnpm-lock.yaml`, `package-lock.json`, `uv.lock`, `poetry.lock`, `go.sum`, `Cargo.lock`) and run locked installs (`npm ci`, `pnpm install --frozen-lockfile`, `uv sync --frozen`, `cargo build --locked`) so registries cannot silently substitute unreviewed versions.
2. **Generate and scan SBOMs (CycloneDX / SPDX) and CVEs systematically** — generate an SBOM (`syft . -o cyclonedx-json=sbom.json` or `cdxgen`) and scan lockfiles + container images (`trivy fs .`, `trivy image <img:tag>`, `osv-scanner`, `govulncheck`, `pip-audit`, `cargo audit`) to surface reachable Critical/High vulnerabilities before release.
3. **Vet new dependencies and block typosquats and malicious install scripts** — before adding a package, verify its exact spelling, maintainer/repo legitimacy, download activity, and license. Prefer `--ignore-scripts` (or pnpm's default lifecycle-script blocking) when installing untrusted packages, and audit any dependency requesting `postinstall` execution.
4. **Pin external CI actions, Docker base images, and binary downloads by digest/SHA** — pin GitHub Actions to 40-char commit SHAs (`actions/checkout@<sha> # v4`), pin Docker images to versioned tags or `@sha256:...` digests, and verify SHA-256 checksums on downloaded CLI binaries — never pipe `curl <url> | bash` in Dockerfiles or CI.
5. **Emit and verify build provenance and signatures** — publish npm packages with `--provenance` (OIDC), PyPI via Trusted Publishers, and sign container images/releases with Cosign/Sigstore when distributing artifacts so consumers can verify the artifact came from your repo's CI.
6. **Remediate vulnerabilities with minimal, verified upgrades** — trace the exact dependency chain (`pnpm why`, `npm ls`, `go mod why`, `cargo tree -i`), upgrade the direct parent package first (avoid blind `audit fix --force` major bumps), use lockfile overrides only as a temporary bridge, and run full tests afterward.
7. **Keep build and runtime environments isolated from unnecessary credentials** — use OIDC short-lived tokens in CI, never mount production secrets during dependency installation, and strip build tools from final runtime container stages (`docker-multistage-hardening`).

## Related skills

- `dependency-audit` — ecosystem-native vulnerability auditing and remediation.
- `dependency-management` — lockfiles, version pinning, and upgrade hygiene.
- `ci-cd-pipeline` — pinned action SHAs, least-privilege permissions, and OIDC auth.
- `docker-multistage-hardening` — pinned base images and zero secrets in build layers.
- `package-publishing` — OIDC trusted publishing and provenance attestations.
