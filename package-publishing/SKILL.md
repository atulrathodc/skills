---
name: package-publishing
description: Package, version, and publish libraries and CLIs to npm, PyPI, and crates.io — SemVer, ESM/CJS exports maps, TypeScript declarations, files whitelists, dry-run tarball checks, OIDC trusted publishing, and provenance.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# Package Publishing

Published package versions are immutable on npm, PyPI, and crates.io — you cannot overwrite a broken release, only publish a patch. Verify the exact packed archive in a clean consumer project before publishing.

1. **Whitelist published files explicitly** — in `package.json`, set `"files": ["dist", "README.md", "LICENSE"]` (or `include` in `Cargo.toml` / `pyproject.toml`) instead of relying on `.npmignore`. Never accidentally ship `.env`, test fixtures, source maps with local paths, or huge assets.
2. **Inspect the real archive with a dry run before publishing** — run `npm pack --dry-run` (npm), `python -m build && twine check dist/* && tar -tzf dist/*.tar.gz` (PyPI), or `cargo package --list` (crates.io). Check every file listed, the total tarball size, and any missing `bin` or `.d.ts` files.
3. **Get Node ESM/CJS `exports` and TypeScript types right** — define `"exports"` in `package.json` with `"types"` listed FIRST in each condition (`"import": { "types": "./dist/index.d.mts", "default": "./dist/index.mjs" }`), set `"sideEffects": false` for tree-shakeable libraries, and verify with `publint` or `@arethetypeswrong/cli` (`attw --pack`) so consumers under NodeNext, Bundler, and CJS all resolve cleanly.
4. **Declare `dependencies`, `peerDependencies`, and `devDependencies` accurately** — frameworks/plugins (`react`, `zod`, `vite`) belong in `peerDependencies` (not `dependencies`) so consumers do not get duplicate runtime instances. Build/test tools belong in `devDependencies`. Never import a `devDependency` from published `src/` code.
5. **Test the packed tarball in an isolated temp directory** — install the generated `.tgz` / `.whl` into `/tmp/smoke-test` (`npm install /path/to/pkg-1.0.0.tgz`) and import/execute both its main API and any `bin` CLI entrypoint. Testing only inside the repo hides missing dependencies, broken `exports`, and missing executable permissions (`chmod +x` + `#!/usr/bin/env node`).
6. **Follow Semantic Versioning strictly and automate changelogs** — breaking API or minimum-runtime-version drops require a major bump (`2.0.0`); additive features are minor (`1.1.0`); bug fixes are patch (`1.0.1`). Use prerelease tags (`1.2.0-beta.1` with `--tag next`) when testing risky releases so `latest` users are unaffected.
7. **Publish from CI with OIDC Trusted Publishing and provenance** — prefer GitHub Actions OIDC publishing (`npm publish --provenance`, PyPI Trusted Publishers) over long-lived personal tokens on a laptop. It ties the published artifact cryptographically to the exact git commit and build workflow.
8. **Verify `engines` / minimum runtime versions and lockstep tags** — declare `engines.node`, `requires-python`, or `rust-version` (MSRV) honestly, tag the exact release commit (`v1.2.3`) in git, and verify the published package installs cleanly from the registry (`npx` / `pip install` / `cargo add`) right after publish.

## Related skills

- `monorepo-management` — converting `workspace:*` refs and coordinating multi-package releases.
- `cli-app` — verifying `bin` entrypoints, shebangs, and cross-platform CLI execution.
- `ci-cd-pipeline` — automating OIDC trusted publishing on git tags.
- `dependency-management` — auditing transitive dependencies before release.
- `type-safety` — emitting clean, strict `.d.ts` declarations.
