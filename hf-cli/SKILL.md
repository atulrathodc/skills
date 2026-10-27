---
name: hf-cli
description: The Hugging Face `hf` CLI — install and auth, download/upload, cache, repos, buckets, jobs, spaces, endpoints, datasets/papers, discussions, collections, and webhooks; replaces the deprecated `huggingface-cli`. Use whenever the task is a Hugging Face command-line operation.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# Hugging Face CLI (`hf`)

Install: `curl -LsSf https://hf.co/cli/install.sh | bash -s`, then check `hf version`. The `hf` command replaces the deprecated `huggingface-cli`. Regenerate the full upstream reference with `hf skills preview`; `hf <command> --help` is always authoritative.

## Core workflow

1. **Auth before anything private** — `hf auth login` (browser or token), `hf auth whoami` to confirm the account, `hf auth list` / `switch` / `logout` for multiple tokens. Prefer `HF_TOKEN` over `--token`; `--token` and `hf auth token` leak into shell history and logs.
2. **Ask for machine output** — every command accepts `--format json` (or `--json`) and `--quiet` (IDs one per line); the default `auto` switches between human and agent output. Parse JSON, never the human table, and keep the exit code.
3. **Downloads land in the cache by default** — `hf download REPO_ID` fills `~/.cache/huggingface/hub` with deduplicated snapshots (symlinks). Use `--local-dir DIR` for real files, `--include "*.safetensors" --exclude "*.bin"` to avoid multi-GB duplicates, `--revision` to pin, and `--dry-run` to preview. `--type dataset|space|kernel` is required for non-model repos.
4. **Uploads auto-create only when asked** — `hf upload REPO_ID ./local [PATH_IN_REPO]`; `--private` applies only if the repo does not exist yet. `--create-pr` opens a PR instead of committing, `--delete PATTERN` prunes in the same commit, and interrupted folder uploads resume when re-run. Do not use `--every` for a one-shot upload.
5. **The cache is disk — manage it with the CLI** — `hf cache list` (sizes, last access), `hf cache prune` (detached/incomplete revisions), `hf cache rm`, `hf cache verify` (checksums). Deleting snapshot/ref directories by hand corrupts the cache. `HF_HOME` / `HF_HUB_CACHE` relocate it.
6. **The command surface** —
    ```text
    auth        hf auth login|whoami|list|token|switch|logout
    files       hf download REPO_ID [FILES] --type ... --revision ... --include ... --local-dir ...
                hf upload REPO_ID LOCAL [PATH_IN_REPO] --type ... --private --create-pr --delete ...
                hf cp SRC DST            # local <-> repo <-> bucket
                hf sync SRC DST          # rsync-like local <-> bucket
    cache       hf cache list|prune|rm|verify
    repos       hf repos list|create|duplicate|move|settings|delete|delete-files|cp
                hf repos branch create|delete
                hf repos tag create|delete|list
    buckets     hf buckets create|list|info|move|remove|settings|cp|sync
    jobs        hf jobs run|uv run|list|logs|wait|inspect|stats|cancel|ssh|hardware|expose
                hf jobs scheduled run|list|inspect|delete|reschedule|suspend|resume|trigger
    spaces      hf spaces list|info|card|search|logs|restart|pause|wait|hardware|templates
                hf spaces dev-mode|ssh|hot-reload|settings|volumes|zero-gpu quota
                hf spaces secrets add|list|delete
                hf spaces variables add|list|delete
    endpoints   hf endpoints catalog list|deploy
                hf endpoints list|describe|deploy|update|hardware|pause|resume|scale-to-zero|delete
    datasets    hf datasets list|info|card|parquet|sql|leaderboard
    models      hf models list|info|card
    papers      hf papers list|info|read|search
    social      hf discussions ... | hf collections ... | hf webhooks ...
    meta        hf env | version | update | skills list|add|preview|update | extensions ...
    ```

## Operating specifics

7. **Repos: always pass `--type`** — it defaults to `model`, so `hf repos delete org/name` without `--type dataset|space` hits the wrong repo (or creates one in `--exist-ok` paths). `delete` is irreversible (`--yes`), `settings` handles `--private/--public/--protected` and `--gated`, and `duplicate`, `delete-files`, `branch`, and `tag` are separate subcommands.
8. **Buckets are mutable object storage; repos are versioned git** — use `hf buckets` for checkpoints, data pipelines, and agent traces. `hf sync SRC DST` is rsync-like: `--dry-run` prints the JSONL plan, `--plan FILE` saves it instead of executing, `--apply FILE` applies a saved plan, and `--delete` removes destination files absent from the source. Use `hf cp` for one-off copies, and published artifacts in repos where revision history matters.
9. **Jobs are remote containers with no local state** — `hf jobs run IMAGE COMMAND --flavor a10g-small` or `hf jobs uv run script.py --flavor ... --with pkg`; `--dry-run` prints the resolved spec. Persist outputs to `--volume hf://buckets/org/b:/mnt:rw` or upload before exit, pass secrets as `--secrets HF_TOKEN` (reads env; `KEY=value` leaks to history), and use `--detach` plus `hf jobs logs --follow` / `wait`. Scheduled jobs use `hf jobs scheduled run CRON IMAGE COMMAND`.
10. **Spaces: read logs before restarting** — `hf spaces logs ID --build` for build failures, plain `logs` for runtime; `hf spaces info` shows the real stage. `dev-mode` + `ssh` gives a shell, `hot-reload` patches one Python file without a rebuild, and `wait` blocks until the Space is running. Secrets/variables are write-only (list returns keys, never values); hardware and sleep time go through `settings`.
11. **Endpoints bill by the minute** — `hf endpoints hardware` and `catalog list` first, then `catalog deploy --repo ... --recipe ...` (shortcut) or `deploy NAME --repo ... --framework ... --accelerator ... --instance-size ... --region ... --vendor ...`. Pause, `scale-to-zero`, or `delete --yes` when idle; `describe` confirms readiness.
12. **Datasets without bulk download** — `hf datasets parquet ID --subset S --split T` returns parquet URLs; `hf datasets sql "SELECT ..."` runs DuckDB against them, which is the fast way to count/inspect. `leaderboard ID` lists benchmark scores; `list --filter benchmark:official` finds leaderboards.
13. **Everything else is a namespace, not a flag** — models (`info`, `card`, `list` with `--search/--author/--sort/--limit`), papers (`list`, `read`, `search`), discussions and PRs (`list`, `create --pull-request`, `merge`, `diff`, `comment`), collections (`add-item`, `update-item`), webhooks (`create --watch`, `enable/disable`), skills, and extensions each have their own subcommand. Find it in the map above instead of guessing top-level flags.
14. **Don't confuse CLIs** — `huggingface-cli login` / `huggingface-cli download` are deprecated; the equivalents are `hf auth login` and `hf download`. `hf update` upgrades the CLI; `hf env` prints versions and cache paths when debugging an install.

## Verify

15. **Prove the operation, not the invocation** — `hf auth whoami` before authed work; `hf models info REPO` / `hf repos list --namespace USER` after a push; `hf cache verify` after a large download; `hf jobs inspect` + `logs` after remote work; `hf spaces info` showing `RUNNING`; `hf endpoints describe` showing ready. Check exit codes and JSON fields — a printed human table is not proof.

## Related skills

- `hf` — the SDK/API side of the Hub (auth, snapshots, uploads, Spaces, Jobs, inference).
- `huggingface-research` — finding and vetting models/datasets.
- `model-registry` — versioning published artifacts.
- `dataset-versioning` — dataset revisions and reproducibility.
- `llm-inference` / `vllm` — serving what you downloaded.
- `secret-management` — keeping `HF_TOKEN` out of history and logs.
