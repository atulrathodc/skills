---
name: streamlit-app
description: Build, debug, and deploy Streamlit Python applications (port 8501) — rerun execution model, st.session_state, @st.cache_data vs @st.cache_resource, headless 0.0.0.0 binding, health checks, and Hugging Face Spaces deployment.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# Streamlit App

Streamlit re-runs the entire Python script from top to bottom on every widget click. Nearly every Streamlit bug — infinite reruns, wiped form inputs, slow reloads, or leaked DB connections — comes from fighting that rerun model.

1. **Respect the top-to-bottom rerun model and initialize `st.session_state` cleanly** — guard session state defaults (`if "messages" not in st.session_state: st.session_state.messages = []`), use `st.form` for multi-field inputs so typing doesn't trigger expensive reruns on every keystroke, and avoid mutating widget keys after the widget is instantiated in the same run.
2. **Use `@st.cache_data` for serializable data and `@st.cache_resource` for shared clients/models** — cache CSV/API/SQL query results with `@st.cache_data(ttl=300)` (returns a safe copy per caller) and cache DB engines, HTTP clients, and ML models with `@st.cache_resource` (shared singleton across sessions). Never put an unserializable DB connection in `@st.cache_data` or mutate a `@st.cache_resource` object per user.
3. **Run headless bound to `0.0.0.0` on port `8501` (or `$PORT`) in containers** — launch with `streamlit run app.py --server.address=0.0.0.0 --server.port=${PORT:-8501} --server.headless=true` (or configure `.streamlit/config.toml`). Disable telemetry (`browser.gatherUsageStats = false`) and never leave `server.runOnSave = true` in production.
4. **Match Hugging Face Spaces port and non-root UID `1000` rules** — on HF Docker Spaces, either set `app_port: 8501` in `README.md` frontmatter OR pass `--server.port=7860`, ensure `HOME=/home/user` is writable for `.streamlit`, and disable CORS/XSRF conflicts cleanly only when behind the platform reverse proxy (`--server.enableCORS=false` only when required by the host proxy).
5. **Keep secrets out of `.streamlit/secrets.toml` in git** — add `.streamlit/secrets.toml` to `.gitignore` and `.dockerignore`; read credentials from `os.getenv(...)` with `st.secrets` only as an optional local fallback so Docker and HF Space Secrets work seamlessly.
6. **Structure multi-page apps cleanly and isolate business logic** — keep pure data/API/domain functions in separate Python modules outside `app.py` so they can be unit-tested with Pytest without needing a Streamlit runtime.
7. **Verify `/_stcore/health` and live browser interaction** — Streamlit exposes `/_stcore/health` (`200 OK`) for Docker/orchestrator healthchecks. Start the app, probe `/_stcore/health`, and exercise interactive widgets and state persistence via `browser-e2e-verification`.

## Related skills

- `huggingface-spaces-deployment` — deploying Streamlit apps privately to HF Spaces.
- `docker-multistage-hardening` — non-root Python containers with healthchecks.
- `browser-e2e-verification` — testing live Streamlit widgets, reruns, and console errors.
- `env-secrets-management` — keeping `secrets.toml` and tokens out of git.
- `python-web-app` — general Python dependency and runtime hygiene.
