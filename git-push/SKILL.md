---
name: git-push
description: Reliably push changes to remote Git repositories without getting stuck, handling large files, restricted files, non-interactive authentication, and upstream rebasing.
allowed-tools: Bash, Read
---

# Git Push — Anti-Stuck & Reliable Execution

Pushing changes to Git must never stall the agent, fail silently, or be blocked by unhandled prompts, buffers, or size limits.

## 1. Non-Interactive Safeguards
Always execute push commands in non-interactive mode:
```bash
GIT_TERMINAL_PROMPT=0 GIT_ASKPASS=echo SSH_ASKPASS=echo \
GIT_SSH_COMMAND="ssh -o BatchMode=yes -o StrictHostKeyChecking=accept-new -o ConnectTimeout=15" \
git push -u origin <branch>
```
- Prevents Git and SSH from waiting on `/dev/tty` or prompting for interactive passphrases.
- Automatically records new remote host keys into `~/.ssh/known_hosts` without prompt.

## 2. Preventing Buffer & Network Stalls
Default Git HTTP buffer is 1MB. For large commits or repositories, chunked transfer can hang or drop connection.
Set:
```bash
git config http.postBuffer 524288000
git config core.packedGitLimit 512m
git config pack.windowMemory 512m
```

## 3. Large Files (>50MB / >100MB)
Before pushing, verify staged files:
- GitHub strictly blocks any file > 100MB (`error: GH001`).
- If an accidental binary is staged (`.jar`, `.tar.gz`, `node_modules/`, `target/`, `.db`):
  ```bash
  git rm -r --cached <path>
  # Add to .gitignore
  git commit --amend --no-edit
  ```
- If an intentional asset must be tracked:
  ```bash
  git lfs install --local
  git lfs track "*.safetensors"
  git add .gitattributes
  ```

## 4. Upstream & Diverged History
- If upstream branch is not set: use `git push -u origin <current-branch>`.
- If push is rejected due to remote changes:
  ```bash
  git pull --rebase origin <current-branch>
  git push origin <current-branch>
  ```

## 5. Stale Lock Recovery
If an interrupted push or build left `.git/index.lock`:
```bash
# Check if lock is stale (>15 seconds old) and remove if dead:
rm -f .git/index.lock .git/HEAD.lock .git/refs/heads/*.lock
```
