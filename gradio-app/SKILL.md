---
name: gradio-app
description: Build, debug, and deploy Gradio Python applications (port 7860) — Blocks vs Interface, server_name 0.0.0.0, queuing and concurrency limits, state isolation, file upload safety, and Hugging Face Spaces deployment.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# Gradio App

Gradio makes AI/ML demos fast to stand up, but production and HF Spaces deployments break when apps bind only to `127.0.0.1`, share mutable global state across users, skip `.queue()` on slow inference, or leave unpinned Gradio major versions.

1. **Bind `0.0.0.0` on port `7860` (configurable via `$PORT` / `$GRADIO_SERVER_PORT`)** — launch with `demo.launch(server_name="0.0.0.0", server_port=int(os.getenv("PORT", "7860")), ssr_mode=False)` (or explicit `ssr_mode` matching your Gradio 5 setup). Binding `127.0.0.1` works locally and fails with `502` inside Docker and HF Spaces.
2. **Use `gr.Blocks` for any multi-step, stateful, or custom-layout app** — reserve `gr.Interface` for single-function prototypes. With `gr.Blocks`, wire explicit `.click()`/`.submit()` events, disable buttons during long runs, and stream partial outputs via Python generators (`yield`) for responsive UX.
3. **Never store per-user state in module-level globals** — module globals leak data between concurrent users and break under multiple workers. Use `gr.State(...)` for per-session state (chat history, active filters, user tokens), and load read-only shared resources (models, DB pools) once at startup.
4. **Enable `.queue()` with explicit concurrency and timeouts for slow/GPU work** — call `demo.queue(default_concurrency_limit=..., max_size=...)` before `.launch()` so long LLM/diffusion/audio calls don't hit HTTP gateway timeouts or OOM the GPU under concurrent clicks.
5. **Pin the exact Gradio major/minor version in `requirements.txt`** — Gradio 3 → 4 → 5 changed `Chatbot` message formats (`messages` dicts vs tuples), `Blocks` theming, and `launch()` parameters. Pin `gradio==<exact>` and verify `README.md` `sdk_version` matches when using native HF Gradio SDK.
6. **Validate uploaded files, sizes, and paths strictly** — restrict `gr.File` / `gr.Image` `file_types` and `max_file_size`, clean up temporary files when needed, and configure `allowed_paths` explicitly if serving local files — never expose `/` or sensitive directories.
7. **Expose a clean health check and verify the live UI** — confirm `GET /` (or a mounted FastAPI `/health` via `gr.mount_gradio_app`) returns `200`, and test the actual UI interaction and console/network tab via `browser-e2e-verification` before declaring done.

## Related skills

- `huggingface-spaces-deployment` — deploying Gradio Docker or SDK Spaces privately on port 7860.
- `docker-multistage-hardening` — non-root UID 1000 Python containers for Gradio.
- `browser-e2e-verification` — testing rendered Gradio controls and streaming via `browser()`.
- `llm-app-integration` — streaming LLM outputs and handling API retries cleanly.
- `env-secrets-management` — loading API keys from env/Space Secrets safely.
