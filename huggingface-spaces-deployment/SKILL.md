---
name: huggingface-spaces-deployment
description: Deploy Docker, Gradio, Streamlit, and Static apps to Hugging Face Spaces — README.md app_port frontmatter, protected/private visibility by default, Bearer-authenticated health probing, UID 1000 non-root containers, Space Secrets, and orphan-branch pushes.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# Hugging Face Spaces Deployment

Deploying to Hugging Face Spaces fails predictably when repos skip `README.md` YAML metadata, forget private-by-default visibility, run as root instead of UID 1000, or push bloated git histories with `.env`/binary files.

1. **Create Spaces as private (protected) by default** — unless the user explicitly asks for a public Space, always create with `private=True` / `--private`. Never expose internal apps, prototypes, or credentials on a public Space URL.
2. **Set valid `README.md` YAML frontmatter at the top of the Space repo** — Spaces requires frontmatter specifying `title`, `sdk` (`docker`, `gradio`, `streamlit`, or `static`), `app_port` (default `7860`; set `8501` if running Streamlit directly without remapping), and `pinned: false`. Invalid YAML or a mismatched `app_port` leaves the Space stuck in `BUILDING` or `502`.
3. **Honor the Docker Space UID `1000` and `0.0.0.0:$PORT` runtime contract** — create `useradd -m -u 1000 user`, set `ENV HOME=/home/user` and `USER 1000`, `chown` writable app/cache directories (`/home/user/app`, `/home/user/.cache`), and bind the server to `0.0.0.0:7860` (or `app_port`). HF Spaces enforces UID 1000 and read-only system dirs.
4. **Probe private Spaces with Bearer authentication** — hitting `https://<owner>-<space>.hf.space/health` without auth on a private Space returns `401`/`404`. Probe health and readiness with `-H "Authorization: Bearer $HF_TOKEN"` (never logging `$HF_TOKEN`) and verify the HF Space runtime API reports `stage == "RUNNING"`.
5. **Use `.dockerignore` and clean orphan-branch pushes for deployment** — exclude `.git`, `.env*`, `node_modules`, `.venv`, `__pycache__`, `dist`, and large local files before pushing. When pushing a subdirectory or sanitized snapshot to a Space remote, push from a clean orphan branch (or `huggingface_hub.upload_folder` with `ignore_patterns`) so secrets, unrelated monorepo history, and >10 MB binary blobs never hit the Space git repo (which rejects non-LFS binaries).
6. **Store credentials in Space Secrets, never in git or Docker `ENV`/`ARG`** — push secrets via `add_space_secret` and non-secret config via `add_space_variable`. Never bake `HF_TOKEN`, database URLs, or API keys into the Dockerfile or `README.md`.
7. **Test the Docker Space locally as UID 1000 before pushing** — run `docker build -t space-test . && docker run --rm -p 7860:7860 --user 1000 space-test` and verify `curl -sf http://localhost:7860/health` returns `200` with zero permission errors.
8. **Verify live build completion and runtime logs after push** — confirm the Space transitions cleanly from `BUILDING` → `RUNNING`, inspect runtime logs for crash loops, and verify the main UI/API endpoint responds as expected.

## Related skills

- `docker-multistage-hardening` — building lean non-root multi-stage Dockerfiles.
- `gradio-app` — configuring Gradio apps on port 7860 for Spaces.
- `streamlit-app` — configuring Streamlit apps on port 8501 for Spaces.
- `env-secrets-management` — keeping HF tokens and secrets out of git and logs.
