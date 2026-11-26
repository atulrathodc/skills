---
name: release-and-versioning
description: Plan, version, and ship software releases cleanly (/release) — Semantic Versioning, Conventional Commits, automated changelogs, lockstep manifest bumps, annotated git tags, pre-release channels, and release verification.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# Release and Versioning

A clean release is boring, repeatable, and traceable to an exact git commit. Never bump versions inconsistently across files, publish from a dirty working tree, or ship breaking changes in a patch release.

1. **Determine the SemVer bump from actual user-facing changes, not guesswork** — inspect commits since the last tag (`git log $(git describe --tags --abbrev=0)..HEAD --oneline`):
   - **MAJOR (`X.0.0`):** breaking API/CLI/config changes, dropped runtime versions, or incompatible schema changes (`feat!:` / `BREAKING CHANGE:`).
   - **MINOR (`0.X.0`):** backward-compatible new features (`feat:`).
   - **PATCH (`0.0.X`):** backward-compatible bug fixes and security patches (`fix:`).
2. **Verify a clean, green release baseline before bumping** — confirm `git status` is clean, you are on the release branch (`main`), `git pull --ff-only` is up to date, and the full lint + typecheck + test + build gate passes.
3. **Keep version numbers synchronized across all manifests** — update every authoritative version file consistently (`package.json` + lockfile, `pyproject.toml`, `Cargo.toml`, `pom.xml`, `Info.plist`, or monorepo Changesets) so the CLI `--version`, runtime banner, and published package match the git tag.
4. **Generate a human-readable changelog grouped by impact** — organize entries under **Breaking Changes**, **Added**, **Changed**, **Fixed**, and **Security** with concise user-facing descriptions and PR/commit references (not raw `wip` / `fix typo` commit dumps). Include migration notes for any breaking change.
5. **Use annotated git tags and pre-release channels for risky changes** — tag releases with `git tag -a v1.2.3 -m "Release v1.2.3"` (annotated tags carry author/date/message and work cleanly with `git describe`). Ship risky changes as pre-releases (`v2.0.0-rc.1` / `--tag next`) before promoting to `latest`.
6. **Verify artifacts with a dry run before publishing or pushing tags** — run `npm pack --dry-run`, `cargo package --list`, or `python -m build && twine check dist/*`, and verify release binaries/checksums before pushing the tag (`git push origin main --follow-tags`).
7. **Verify the live release after publish** — confirm the GitHub Release notes, attached artifacts/checksums, and registry install (`npx`, `pip install`, `cargo add`, or Docker tag pull) resolve to the exact new version.

## Related skills

- `package-publishing` — npm, PyPI, and crates.io tarball checks and OIDC provenance.
- `git-workflow` — clean commit history and branching discipline.
- `ci-cd-pipeline` — automating tagged releases and trusted publishing.
- `monorepo-management` — coordinating multi-package workspace version bumps.
- `deployment-verification` — verifying deployed services match the released version.
