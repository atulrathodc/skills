---
name: git-workflow
description: Keep the working tree clean, manage .gitignore and .dockerignore carefully, handle large and restricted files, and push changes reliably without getting stuck.
allowed-tools: Bash, Read, Grep, Glob
---

# Git Workflow & Reliable Push

Maintain a clean, reviewable repository and ensure Git operations (add, commit, push) never hang or fail due to ignore oversights, large files, or credential prompts.

## 1. Non-Interactive, Anti-Stuck Git Operations
When executing Git or SSH via Bash, always ensure non-interactive operation so Git never hangs waiting on terminal input or host key confirmations:
- **Environment**: Ensure `GIT_TERMINAL_PROMPT=0`, `GIT_ASKPASS=echo`, `SSH_ASKPASS=echo`.
- **SSH**: Use `ssh -o BatchMode=yes -o StrictHostKeyChecking=accept-new` to prevent prompts for unknown host keys while failing fast if authentication keys are absent.
- **Stale locks**: If an interrupted process left `.git/index.lock` or `.git/HEAD.lock`, inspect its age. If older than 15s or the holding process is dead, remove it before running Git.
- **HTTP Post Buffer**: For pushes over HTTPS, configure `git config http.postBuffer 524288000` (500MB) to prevent chunked transfer drops (`Broken pipe`, `fatal: the remote end hung up unexpectedly`).

## 2. Managing .gitignore and .dockerignore Carefully
- **Preserve Existing Content**: Never overwrite user ignore files or wipe out custom rules and comments.
- **Deduplicate**: Normalize patterns before adding to avoid redundant lines.
- **Standard Categorization**:
  - `Mini Agent Data`: `.mini/`, `.mini`, `*.db`, `*.db-wal`, `*.db-shm`
  - `Environment & Secrets`: `.env`, `.env.local`, `.env.*.local`, `*.pem`, `*.key`, `id_rsa`, `id_ed25519`
  - `Dependencies`: `node_modules/`, `vendor/`, `.venv/`, `venv/`
  - `Build Artifacts & Caches`: `dist/`, `build/`, `out/`, `target/`, `*.class`, `*.jar`, `*.pyc`, `__pycache__/`, `.cache/`, `tmp/`
  - `Large Binaries`: `*.tar.gz`, `*.zip`, `*.iso`, `*.bin`, `*.safetensors`, `*.onnx`
  - `OS & IDE`: `.DS_Store`, `Thumbs.db`, `.idea/`, `.vscode/`
- **Synchronize .dockerignore**:
  - Mirror ignore rules for `.git/`, `.gitignore`, `.mini/`, `node_modules/`, `target/`, `.env*`, and build caches so Docker build contexts stay lightweight and fast.
- **Untrack Newly Ignored Files (Cache Cleanup)**:
  - Adding a file to `.gitignore` does not remove it if it was already tracked in the Git index.
  - Run `git rm -r --cached --ignore-unmatch <paths>` to remove tracked ignore targets without deleting local files from disk.

## 3. Large File Handling (>50MB Warning, >100MB GitHub Reject)
- **Check File Sizes**: GitHub rejects individual files > 100MB (`GH001`) and warns at 50MB.
- **Accidental Artifacts**: If the large file is an unintentional binary or build output (e.g. `.jar`, `.db`, `node_modules/`, `target/`, `.venv/`, `.tar.gz`), add it to `.gitignore` and untrack it with `git rm --cached`.
- **Intentional Assets (Git LFS)**:
  - For models, datasets, or media assets that must be tracked, verify `git lfs version`.
  - Initialize Git LFS: `git lfs install --local`.
  - Track the pattern: `git lfs track "<pattern>"`.
  - Stage `.gitattributes`: `git add .gitattributes`.

## 4. Restricted File & Permission Handling
- **Restricted Read Permissions**: If a file has restrictive permissions (`chmod 0400` or missing user read bit), restore readability (`chmod u+r`) before staging.
- **Executable Bits**: Ensure script entry points (`.sh`, `.bash`) have executable permissions both on filesystem and in the Git index: `chmod +x <script>` and `git update-index --chmod=+x <script>`.
- **Ignored / Restricted Files**: If an intentionally tracked file matches a `.gitignore` pattern, stage it using `git add -f <file>` or unignore it with `!path/to/file`.
- **Dubious Ownership**: In container or shared mount environments, configure `git config --global --add safe.directory "<workspace>"` if ownership mismatch warnings appear.
- **Secret Scanning Pre-Check**: Inspect `git diff --cached` for private keys (`BEGIN PRIVATE KEY`), tokens, or staged `.env` files to prevent remote push rejection by GitHub Secret Scanning (`GH013`).

## 5. Reliable Push Sequence
1. Check `git status` and verify only intended files are staged.
2. Resolve current branch: `git branch --show-current`.
3. Push with upstream: `git push -u origin <branch>`.
4. If remote has new commits (`[rejected - non-fast-forward]`), run `git pull --rebase origin <branch>` before pushing.
5. On transient socket drops (`Connection reset`, `Broken pipe`), retry with exponential backoff (2s, 4s).
