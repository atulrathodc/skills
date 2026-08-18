---
name: configuration-loading
description: Wire an app's configuration correctly — env vars, config files, .env, profiles, precedence — and stop hardcoding values.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# Configuration Loading

The app behaves differently than expected? Check what config it actually loaded, before touching logic.

1. **Find what the app reads** — `process.env.X` (Node), `os.getenv` (Python), `@Value`/`application.properties` (Spring), `.env`, config files. Grep the config keys.
2. **Wire values the RIGHT way:**
   - **Env vars** — set them in the run command / `.env` (dev) / systemd (see `production-process`). Never hardcode endpoints, ports, or DB URLs in source.
   - **Profiles/environments** — `NODE_ENV`, `SPRING_PROFILES_ACTIVE`, `.env.production` — the app reads the ACTIVE profile; set it, don't edit the wrong file.
   - **Precedence** — env > profile > config file > default. A "change that does nothing" is usually a lower-precedence value being overridden.
3. **Troubleshoot "not working":**
   - The app uses `process.env.PORT` but you set `PORT` after starting → env is read at startup; restart to pick it up.
   - `.env` not loaded → the runner doesn't load it; pass it (`node --env-file=.env` / `python-dotenv` / `set -a; source .env`).
   - Spring can't resolve a property → missing key or wrong profile; the startup log names it (see `startup-failure-recovery`).
4. **Secrets** — read tokens/keys from env, never source (see `secret-management`).
5. **Verify** — confirm the app RUNS with the intended value (log it once or check the behavior), not just that the config file "looks right".
