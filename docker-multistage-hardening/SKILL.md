---
name: docker-multistage-hardening
description: Build lean, secure, production-ready multi-stage Dockerfiles — non-root USER, minimal runtime bases, .dockerignore, layer caching, pinned digests/versions, zero build secrets in image layers, and HEALTHCHECK verification.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# Docker Multi-Stage Hardening

A single-stage `FROM node:latest` Dockerfile running as `root` ships compilers, devDependencies, git history, and root privileges straight into production. Always separate build from runtime and drop root.

1. **Always use a multi-stage build (builder → slim/distroless runtime)** — install build tools, compilers, and devDependencies in `AS builder`, compile/bundle the app, and `COPY --from=builder` ONLY the final production artifact (`dist/`, static binary, `.venv`, or pruned `node_modules`) into a minimal runtime image (`node:22-slim`, `python:3.12-slim`, `gcr.io/distroless/static-debian12`).
2. **Run as a dedicated non-root `USER`** — create an unprivileged user/group (`addgroup --system app && adduser --system --ingroup app app` or use `USER node` / `USER 65532:65532` in distroless), `COPY --chown=app:app`, and switch with `USER app` before `CMD`/`ENTRYPOINT`. Never leave containers running as `root` (UID 0).
3. **Write a strict `.dockerignore` before running `docker build`** — exclude `.git`, `.env*`, `node_modules`, `.venv`, `dist`, `target`, `coverage`, `*.log`, and IDE folders. A missing `.dockerignore` leaks `.env` secrets into the image context and invalidates cache on every edit.
4. **Order layers for maximum build cache hits** — copy lockfiles and manifests FIRST (`package.json`, `pnpm-lock.yaml`, `requirements.txt`, `go.mod`, `go.sum`, `pom.xml`), run the locked dependency install (`npm ci`, `pnpm install --frozen-lockfile`, `go mod download`), and copy application source LAST.
5. **Never bake secrets into `ENV`, `ARG`, or `COPY` layers** — values passed via `ARG` or `COPY .env` stay permanently recoverable in `docker history` and intermediate layers. Use BuildKit secret mounts (`RUN --mount=type=secret,id=npmrc ...`) for private registry auth during build, and inject runtime secrets via orchestrator env/secret mounts.
6. **Pin base image versions explicitly** — use specific minor/patch tags or immutable digests (`node:22.14-slim` or `@sha256:...`), never floating `:latest` tags that break builds unpredictably. Clean apt/apk caches in the same `RUN` layer (`rm -rf /var/lib/apt/lists/*`).
7. **Use JSON exec-form `ENTRYPOINT`/`CMD` and handle signals properly** — write `CMD ["node", "dist/server.js"]`, NOT shell-form `CMD node dist/server.js` (shell form spawns `/bin/sh -c` as PID 1, swallowing `SIGTERM` and delaying shutdown by 10–30s).
8. **Add a real `HEALTHCHECK` and verify the built image locally** — add `HEALTHCHECK` hitting `/health` (or configure probes in Compose/K8s), build the image, confirm `docker run --rm <image> id` shows a non-root UID, inspect `docker images` for reasonable size, and verify `/health` responds `200` on `0.0.0.0:$PORT`.

## Related skills

- `docker-container` — general Docker workflow and container debugging.
- `microservices-orchestration` — composing hardened multi-service images locally.
- `huggingface-spaces-deployment` — UID 1000 and port 7860 requirements for HF Docker Spaces.
- `env-secrets-management` — injecting runtime secrets safely outside images.
- `kubernetes-deployment` — running non-root images with `securityContext` in K8s.
