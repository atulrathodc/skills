---
name: git-workflow
description: Keep the working tree and commit history clean and reviewable.
allowed-tools: Bash, Read
---

# Git Workflow

- Check `git status` and `git diff` before committing.
- Make focused commits — one logical change per commit.
- Use descriptive messages: imperative summary line, then a body with the why.
- Do not commit secrets, build artifacts, or generated files.
- Prefer rebasing feature branches onto main over merging main in.
- Squash fixups into the commit they belong to before pushing.
- Before pushing, verify the branch contains only intended commits.
- Never force-push shared branches.
