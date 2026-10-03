---
name: new-technology-adoption
description: Evaluate and onboard a new technology (language, framework, library, runtime, platform, protocol) before committing to it.
allowed-tools: Bash, Read, Write, Edit, Glob, Grep, web_search, web_fetch
---

# New Technology Adoption

Never adopt (or reject) a technology from memory alone — verify it exists, is current, and works here.

1. **Existence & currency** — before anything else, confirm the thing is real and not a hallucinated API, version, or package name. `web_search` the official docs/repo/release notes and cite a URL **and a date**; if recency is unverifiable, say so instead of guessing.
2. **Maturity, license, health** — check the actual facts, not the landing page: latest release + cadence, 1.0 vs 0.x, stars/contributors are weak signals but **commit recency, open-issue backlog, bus factor** matter; confirm the license and whether it fits your use (copyleft, AGPL, source-available).
3. **Security posture** — look for a real CVE/OSV history, advisories, and a disclosure process; run `npm audit` / `pip-audit` / `cargo audit` / `govulncheck` on the actual dependency before trusting it.
4. **Fit against the existing stack** — map it in: language/runtime alignment, overlap with what you already run, migration/exit cost, team familiarity. Absent evidence, prefer solving it with the current stack over adopting a second one.
5. **Decide adopt vs trial vs hold vs reject** — Adopt (use by default), Trial (use in one real non-critical project), Hold (don't start new use), Reject (no). Write the decision and a one-line rationale.
6. **Spike in the real environment** — a doc-only read is NOT validation. Install it in this repo, wire the smallest end-to-end path (import → call → observable result), and get it running: `curl`/CLI/browser, exit code 0. Fail fast here; it is cheaper than after adoption.
7. **Measure** — record the concrete numbers that decide: install/build time, bundle or binary size delta, startup, latency/throughput vs the incumbent, and any version/pinning conflicts with existing deps.
8. **Record & pin** — write the decision where the team sees it (ADR / `docs/`), pin an exact version, and note the rollback path. Re-check on the next major release or security advisory.

Verify: the spike runs in this environment with a captured command + output (not just "it installed"); the decision, its date, and its sources are recorded.

## Related skills

- `ai-news-research` — sourcing and dating the "is it current" evidence.
- `runtime-verification` — proves the spike actually works end-to-end, not just compiles.
- `benchmark-search` — finding credible comparison numbers before measuring yourself.
- `architecture-discovery` — fitting the new piece into the existing stack.
