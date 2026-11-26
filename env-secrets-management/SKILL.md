---
name: env-secrets-management
description: Manage environment variables and secrets safely across local dev, Docker, CI, and cloud — zero leaked tokens in git/logs/client bundles, .env.example parity, startup schema validation, and safe secret rotation.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# Env and Secrets Management

A single committed `.env`, leaked `HF_TOKEN`/`OPENAI_API_KEY` in a build log, or secret prefixed with `NEXT_PUBLIC_`/`VITE_` compromises the whole app instantly. Treat every credential as toxic outside a secret store.

1. **Never commit real secrets or `.env` files to git** — add `.env`, `.env.local`, `.env.*.local`, `*.pem`, `*.key`, and credential JSONs to `.gitignore` AND `.dockerignore` on day one. Commit ONLY `.env.example` with empty or clearly fake placeholder values (`DATABASE_URL=postgres://user:pass@localhost:5432/app`, `API_KEY=`).
2. **Never prefix secrets with client-exposed prefixes** — anything starting with `NEXT_PUBLIC_`, `VITE_`, `REACT_APP_`, `NUXT_PUBLIC_`, or `PUBLIC_` is bundled verbatim into browser JavaScript. Only publishable keys (`pk_live_...`, public URLs) belong there; API keys, JWT secrets, DB URLs, and webhook secrets must stay server-only.
3. **Never print, log, or echo secret values** — never run `env`, `printenv`, `console.log(process.env)`, or `cat .env` in logs, error reports, or CI output. Redact `Authorization`, `Cookie`, `X-Api-Key`, `token`, and `password` fields in structured loggers before emission.
4. **Validate all required env vars at startup with a single typed schema** — parse `process.env` / `os.environ` at boot (Zod, Pydantic `BaseSettings`, Spring `@ConfigurationProperties`, Go struct loader) and fail immediately with the missing variable *name* (never its value) if required config is absent.
5. **Separate non-sensitive config from secrets** — store feature flags, log levels, ports, and public URLs as plain environment variables; store passwords, signing keys, OAuth client secrets, and cloud tokens in platform secret stores (GitHub Secrets, HF Space Secrets, AWS/GCP Secret Manager, Vault, Kubernetes External Secrets).
6. **Use distinct credentials per environment (dev, staging, prod)** — never share production database URLs, Stripe live keys (`sk_live_`), or JWT signing secrets with local dev or staging.
7. **Scan for accidental leaks before committing or pushing** — check `git diff --cached` for high-entropy tokens (`ghp_`, `hf_`, `sk-`, `AKIA`, `-----BEGIN PRIVATE KEY-----`) and run `gitleaks` / `trufflehog` in CI. If a secret ever hits git history, **rotate/revoke it immediately** — deleting it in a follow-up commit does not remove it from history.

## Related skills

- `configuration-loading` — loading and validating app configuration cleanly.
- `service-url-config-mapping` — wiring non-secret service URLs across environments.
- `docker-multistage-hardening` — keeping secrets out of Docker build layers.
- `huggingface-spaces-deployment` — using Space Secrets vs Space Variables safely.
