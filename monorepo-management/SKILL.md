---
name: monorepo-management
description: Structure, build, test, and maintain multi-package monorepos — pnpm/npm/yarn workspaces, Turborepo/Nx task graphs and caching, internal package linking, circular dependencies, TypeScript project references, and affected-only CI.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# Monorepo Management

Monorepos fail slowly through phantom dependencies, broken build order, and 20-minute CI runs that rebuild everything on a one-line docs change. Keep package boundaries crisp and task graphs honest.

1. **Read the workspace config before touching any package** — inspect `pnpm-workspace.yaml` / root `package.json` (`workspaces`), `turbo.json` or `nx.json`, and root `tsconfig.base.json`. Always run installs and scripts through the repo's chosen package manager (`pnpm`, `yarn`, `bun`, `npm`) — never mix lockfiles.
2. **Use explicit workspace protocol references for internal packages** — reference sibling packages with `"@repo/ui": "workspace:*"` (pnpm/yarn) so they always resolve locally and convert cleanly to real versions on publish. Never import across packages via relative paths like `../../../packages/shared/src`.
3. **Eliminate phantom dependencies** — every package must declare every package it directly imports in its own `package.json`. Relying on hoisted root dependencies breaks under pnpm strict mode, Docker pruning, and publishing.
4. **Declare accurate task inputs and outputs in the orchestrator** — in `turbo.json` / `nx.json`, set `dependsOn: ["^build"]` so upstream libraries compile before downstream apps, and list every `outputs` directory (`dist/**`, `.next/**`) and `env` var that affects output. Missing an env var causes stale cache hits in production builds; missing `outputs` causes empty cache restores.
5. **Prevent circular package dependencies** — the workspace graph must be a DAG. If `pkg-a` and `pkg-b` both need shared types or utilities, extract a leaf `pkg-types` / `pkg-core` package rather than introducing a cycle.
6. **Align shared dependency versions across packages** — mismatched versions of React, TypeScript, Zod, or ESLint across workspaces cause duplicate runtime instances (e.g., invalid hook call errors) and cryptic type incompatibilities. Use pnpm catalogs (`catalog:`), Syncpack, or workspace-level constraints to keep core versions unified.
7. **Configure TypeScript cleanly for internal packages** — either use `composite: true` with `references` (`tsc -b`) for compiled internal libraries, or point internal-only packages directly at TypeScript source via `exports` when the consuming bundler transpiles them. Never leave stale `.tsbuildinfo` or unbuilt `dist/` artifacts hiding type errors.
8. **Scope CI and Docker builds to affected packages** — in CI, run `turbo run lint typecheck test build --filter=...[origin/main]` (or `nx affected`) so PRs only test impacted subgraphs. In Docker, use `turbo prune <app> --docker` (or `pnpm deploy --filter=<app> --prod`) so container layers stay small and cacheable.
9. **Keep root `package.json` lean** — put only repo-wide dev tooling (orchestrator, linter, formatter, TypeScript) at the root; keep runtime dependencies inside the specific app or package that uses them.
10. **Verify from a clean state** — after structural or dependency changes, test a cold build of the target app (`pnpm --filter <app>... build --force`) to ensure no task silently depended on leftover `dist/` files.

## Related skills

- `dependency-management` — lockfiles, version pinning, and upgrade hygiene.
- `package-publishing` — versioning and publishing workspace packages with Changesets or SemVer.
- `ci-cd-pipeline` — caching and affected-only matrix workflows in CI.
- `build-failure-recovery` — diagnosing broken builds and stale caches.
- `type-safety` — TypeScript project references and strict compiler configs.
