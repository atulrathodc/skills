---
name: full-stack-web-app
description: Build a complete RUNNING web app — backend API + frontend + wiring + run + verify.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write, List
---

# Full-Stack Web App

Build a complete web app that RUNS end to end, and prove it.

1. **Decide the stack from the task.** Prefer the repo's existing stack. For a fresh app, pick a stack the environment supports (Node/Express + static frontend, Python/FastAPI, Spring Boot — see `spring-boot-app`).
2. **Scaffold the MINIMAL runnable version first** — one backend endpoint + one frontend page + wiring. Add features only after it runs.
3. **Define the JSON contract** — backend routes + request/response payloads. Make the frontend match that contract (see `frontend-backend-integration`).
4. **Install deps, build, START both servers** (background), probe the backend port and the frontend port, and confirm a real request round-trips (see `make-it-run`).
5. **Then iterate features** — each feature verified against the RUNNING app, not just compiled.
6. Only call `done()` when both servers are up and the requested feature responds through the UI/API.
