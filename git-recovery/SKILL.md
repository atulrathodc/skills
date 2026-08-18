---
name: git-recovery
description: Undo or recover from git mistakes safely — revert, reset, reflog, stash, branch recovery — without losing work.
allowed-tools: Bash, Read, Grep
---

# Git Recovery

Every git mistake is recoverable. Inspect BEFORE you act — a bad `reset --hard` is the one irreversible one.

1. **Inspect the state first** — `git status`, `git log --oneline -10`, `git diff` (unstaged), `git diff --staged`. Know exactly where you are before changing anything.
2. **Undo choices, by situation:**
   - **Bad commit pushed / shared** → `git revert <sha>` (adds an undo commit — safe for shared history). Never rewrite shared history.
   - **Bad local commit, not pushed** → `git reset --soft HEAD~1` keeps the changes staged; `git reset HEAD~1` keeps them unstaged. `--hard` DISCARDS them — only when you truly want them gone.
   - **Lost a commit / deleted a branch** → `git reflog` lists every HEAD move; find the sha and `git checkout <sha>` / `git branch <name> <sha>` to resurrect it.
   - **Stashed work missing** → `git stash list`; `git stash apply` (keeps) vs `pop` (removes from stash).
   - **File reverted by mistake** → `git checkout -- <file>` restores from HEAD — but only if the changes were never committed; committed-then-lost = reflog/`git fsck --lost-found`.
   - **Merge conflict mid-way** → see `merge-conflict-resolution`; `git merge --abort` safely backs out.
3. **Never** `git reset --hard` / `git clean -fd` without first confirming the target is genuinely disposable.
4. **When unsure** — `git stash create` or copy the working tree before attempting an irreversible command.
5. After recovery, verify with `git status` + a build/test that the tree is the intended state.
