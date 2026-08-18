---
name: python-web-app
description: Create and run Python web apps — venv, pip, Flask/FastAPI/uvicorn, __main__, port.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# Python Web App

The Python lifecycle that gets a Python app running.

1. **venv first** — `python3 -m venv .venv && source .venv/bin/activate`. Install into the venv, not globally.
2. **Deps** — `pip install -r requirements.txt` (create it with `pip freeze > requirements.txt` after adding deps). If install fails, see `dependency-install-recovery`.
3. **Frameworks** — Flask (`app = Flask(__name__)` + `app.run(port=...)`), or FastAPI + `uvicorn app:app --port <port>` (async). Pick what the task implies.
4. **Entrypoint** — a `if __name__ == "__main__":` block so `python app.py` works; or a `start` script (`uvicorn app:app --host 0.0.0.0 --port <port>`).
5. **Run in the background** — start it via `run_in_background:true`, note the port, probe it (see `make-it-run`, `http-api-testing`).
6. **Fix → restart** — kill the old process before restarting (the port stays bound, `Address already in use`).
7. Only `done()` when `curl` against the port returns the expected response.
