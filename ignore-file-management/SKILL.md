---
name: ignore-file-management
description: Carefully manage .gitignore and .dockerignore files, preserving existing rules, categorizing sections, avoiding duplicates, and untracking cached ignore targets.
allowed-tools: Bash, Read, Write, Edit
---

# Ignore File Management (.gitignore & .dockerignore)

Maintain clean, accurate ignore files across repositories and Docker container build contexts.

## 1. Golden Rules
- **Preserve User Entries**: Never overwrite existing ignore files or wipe out custom comments or negations (`!pattern`).
- **Deduplicate**: Check existing rules before adding to avoid redundant lines.
- **Categorize Sections**: Keep entries organized by purpose with clear header comments.
- **Untrack from Git Cache**: Adding a file to `.gitignore` does not remove it if it was previously staged. Always untrack with `git rm -r --cached --ignore-unmatch <paths>` to remove it from Git while keeping the physical files on disk.

## 2. Standard .gitignore Structure
```gitignore
# ── Mini Agent Data ──
.mini/
.mini
*.db
*.db-wal
*.db-shm

# ── Environment & Secrets ──
.env
.env.local
.env.*.local
*.pem
*.key
id_rsa
id_ed25519

# ── Dependencies ──
node_modules/
vendor/
.venv/
venv/

# ── Build Artifacts & Caches ──
dist/
build/
out/
target/
*.class
*.jar
*.pyc
__pycache__/
.cache/
tmp/

# ── Large Binaries & Archives ──
*.tar.gz
*.zip
*.iso
*.bin
*.safetensors
*.onnx

# ── OS & IDE Noise ──
.DS_Store
Thumbs.db
.idea/
.vscode/
```

## 3. Synchronizing .dockerignore
Ensure `.dockerignore` mirrors build ignore requirements so Docker build contexts remain small and fast:
- Always ignore: `.git/`, `.gitignore`, `.mini/`, `.env*`, `node_modules/`, `target/`, `build/`, `dist/`, `*.log`, `.DS_Store`.
- Never ignore files explicitly copied in the Dockerfile (like `package.json`, source folders, entrypoint scripts).
