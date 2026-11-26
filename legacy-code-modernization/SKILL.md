---
name: legacy-code-modernization
description: Assess technical debt and modernize legacy codebases incrementally (/debt, /modernize) — characterization tests, strangler-fig migrations, major framework upgrades, prioritized debt roadmaps, and zero big-bang rewrites.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# Legacy Code Modernization

Big-bang rewrites almost always stall, miss undocumented edge cases, and ship new bugs. Modernize legacy systems incrementally behind safety nets so the codebase stays shippable after every single PR.

1. **Prioritize tech debt by risk × churn, not aesthetics** — combine `git log --format=format: --name-only -n 100 | sort | uniq -c | sort -rn` (high-churn hotspots) with bug density, security exposure (EOL runtimes/CVEs), and onboarding pain. Leave stable, rarely touched legacy modules alone until you actually need to change them.
2. **Write characterization tests before touching untested legacy code** — pin the system's *actual current behavior* (including quirky edge cases) with black-box HTTP/CLI/unit tests before refactoring or migrating. Without a characterization harness, you cannot distinguish a bug fix from an accidental regression.
3. **Use the Strangler-Fig pattern instead of big-bang rewrites** — route one endpoint, page, or domain workflow at a time to the new implementation behind a router/facade/feature flag, verify parity in production (or shadow-compare old vs new outputs), and delete the old path only after the new one is proven.
4. **Upgrade major runtimes and frameworks one major step at a time** — never jump React 16 → 19, Next 12 → 15, Spring Boot 2 → 3, or Python 3.8 → 3.13 in one giant PR. Follow official migration guides and codemods one major version at a time, fixing deprecation warnings and verifying green builds between each jump.
5. **Introduce seams before replacing coupled dependencies** — wrap legacy singletons, raw DB globals, or deprecated SDKs behind a small adapter/port interface (`hexagonal-and-clean-architecture`) so callers migrate cleanly without editing 60 files at once.
6. **Keep modernization PRs small, focused, and independently deployable** — separate mechanical codemods, dependency upgrades, and behavioral changes into distinct commits/PRs so any issue can be bisected or reverted in seconds.
7. **Produce a concrete, phased debt roadmap when running `/debt` or `/modernize`** — group items into **P0 (security/EOL blockers)**, **P1 (high-churn reliability/velocity bottlenecks)**, and **P2 (cleanup/ergonomics)**, each with exact file paths, effort estimate, risk, and verification criteria.

## Related skills

- `systematic-refactoring` — safe, atomic, behavior-preserving refactoring steps.
- `dead-code` — removing obsolete modules after strangler-fig cutovers.
- `dependency-audit` — identifying EOL runtimes and vulnerable legacy packages.
- `regression-guardrails` — verifying zero behavior drift across migrations.
