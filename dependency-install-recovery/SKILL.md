---
name: dependency-install-recovery
description: Fix dependency install failures — npm/maven/pip registry, lockfile, version conflicts, cache, network/proxy.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# Dependency Install Recovery

An app that can't install deps can't run. Fix the install, don't work around it.

1. **Capture the FIRST error** — `npm ERR!` / `[ERROR] Could not resolve` / `ERROR: Could not find a version` / `ModuleNotFoundError`. The first error names the real problem.
2. **Classify:**
   - **Version conflict / resolution failure** → the manifest demands an impossible combination. Read the error's "conflicts with" pair, then change the manifest (pin a compatible version) or remove the offending dep.
   - **Registry / download failure (ETIMEDOUT, 404, certificate)** → the registry is unreachable. Check the registry config (`npm config get registry`, `~/.m2/settings.xml`, `PIP_INDEX_URL`), or retry (transient).
   - **Native build failure (node-gyp, no compiler, missing header)** → the package needs a toolchain; use a prebuilt wheel/binary or install the build tool.
   - **Cache corruption** → clear the cache (`npm cache clean --force`, `mvn -q dependency:purge-local-repository`, `pip cache purge`) and retry.
   - **Lockfile out of sync** → regenerate it (`rm package-lock.json && npm install`, `mvn -q -U`, `pip install -r requirements.txt`).
3. **Apply the minimal fix** — usually manifest or registry, not a blind reinstall loop (re-running the same install is the #1 waste).
4. **Re-install and confirm** — the dependency must actually resolve before building/running the app.
