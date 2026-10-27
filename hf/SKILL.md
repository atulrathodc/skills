---
name: hf
description: Hugging Face Hub end-to-end — authentication, finding and resolving models/datasets, download and cache, uploads, loading with transformers, Spaces, Jobs, and Inference Endpoints; use the huggingface_hub SDK/API, and defer to `hf-cli` for the `hf` command line.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# Hugging Face Hub

The Hub is the default source of open models, datasets, and demos. Use `huggingface_hub` / the REST API instead of scraping pages, and use `hf-cli` when the task is a shell command.

## Hub essentials

1. **Auth is ambient, but gating is not** — `export HF_TOKEN=...` (token from huggingface.co/settings/tokens); the SDK, `transformers`, `datasets`, and the CLI pick it up. `huggingface_hub.login()` persists it to `~/.cache/huggingface/token`. A gated model needs BOTH accepting its license on the model page AND a read token — otherwise you get 401/`GatedRepoError` even though the repo is public-looking.
2. **Resolve before you download** — `HfApi().model_info(repo_id, files_metadata=True)` / `dataset_info()` gives the card, license, tags, params, gating, and files. Inspect the layout (`config.json`, tokenizer files, `*.safetensors`) and pick a quantization that matches your runtime. A repo can be public and still unusable (custom code, missing weights, a base model that needs an adapter).
3. **Pin a revision** — `revision="main"` moves under you; use a tag or commit hash for anything reproducible or deployed. Branch names are fine for development, not for benchmarks or production.
4. **Download with the SDK, not with `requests`** — `hf_hub_download(repo_id, filename)` for one file, `snapshot_download(repo_id, allow_patterns=[...], ignore_patterns=[...])` for a whole repo. Both use the cache, resume partial downloads, and return the local path. `local_dir=` copies real files instead of cached symlinks — convenient for Docker/rsync, but it duplicates disk.
5. **Cache env vars** — `HF_HOME` (root), `HF_HUB_CACHE` (hub cache), `HF_HUB_OFFLINE=1` (never touch the network; fails if something is missing), `HF_HUB_ENABLE_HF_TRANSFER=1` (much faster transfers, needs `hf_transfer`). Point the cache at a big disk, and do not symlink one cache across machines.
6. **Uploads are API calls** — `create_repo(repo_id, repo_type="model", private=True, exist_ok=True)` then `HfApi().upload_folder(folder_path, repo_id, path_in_repo=..., commit_message=...)` (or `upload_file`). LFS is automatic; big folders are split into multiple commits and resume. Use `create_pr=True` for review and `delete_patterns=[...]` to prune. Do not hand-push weights with git.

## Download and load

7. **Load with `transformers`** — `AutoModelForCausalLM.from_pretrained(repo_id, torch_dtype="auto", device_map="auto")` plus `AutoTokenizer.from_pretrained(repo_id)`. `trust_remote_code=True` executes code shipped in the repo — only for a repo you trust. Quantized repos may need `bitsandbytes` / `autoawq`; GGUF and MLX repos use `llama.cpp` / `mlx-lm` loaders, not `transformers`.
8. **Datasets: stream before downloading** — `load_dataset("org/name", split="train")`, add `streaming=True` to iterate without materializing the dataset; `data_files=` for raw jsonl/csv/parquet. Public datasets expose parquet under `hf://datasets/org/name/` — query those URLs with DuckDB or `hf datasets sql` instead of pulling gigabytes.
9. **Reproduce the exact run** — record `repo_id`, `revision`, tokenizer revision, quantization, and the load code. A different `main` or a silently auto-updated dependency is the usual "same script, different numbers".

## Publish and run

10. **Spaces are repos plus a runtime** — README metadata (`sdk: gradio|docker|static`, `app_file`, `sdk_version`) decides the build. Dependencies belong in `requirements.txt` / `pyproject.toml`, not the local venv. Secrets and variables are injected as env vars, `HF_TOKEN` is available, and ZeroGPU requires `@spaces.GPU`. Diagnose from `logs` (build vs runtime) and `restart`/`dev-mode`; never judge state from the web UI alone.
11. **Jobs are ephemeral GPU containers** — `hf jobs uv run script.py --flavor a10g-small --detach` (or `hf jobs run IMAGE CMD`) runs remotely. Nothing local is preserved: write checkpoints to a mounted bucket/volume or upload before the container exits, pass tokens via secret env vars, and follow `logs` / `wait` — a submitted job is not a finished job.
12. **Inference: providers vs endpoints** — serverless Inference Providers through `InferenceClient(provider="auto")` or the OpenAI-compatible router (`https://router.huggingface.co/v1`) for on-demand calls; dedicated Inference Endpoints when you need guaranteed hardware, private models, or custom images. Endpoints bill while running — pause, scale-to-zero, or delete them when idle.
13. **The CLI is a separate surface** — `hf` replaces the deprecated `huggingface-cli`. Use `hf-cli` for exact commands and gotchas (`hf auth`, `--format json`, cache/jobs/spaces/endpoints). From Python, prefer the SDK method over shelling out to the CLI.

## Verify

14. **Verify the artifact, not the transfer** — confirm the revision and file count, check that a `snapshot_download` is complete, then load the model and run a forward pass or generate a few tokens. An upload that "succeeded" is still not a model that loads. Check the license and gating before wiring it into a product.

## Related skills

- `hf-cli` — the `hf` command line: auth, download/upload, cache, jobs, spaces, endpoints.
- `huggingface-research` — finding and vetting models/datasets before committing to one.
- `model-registry` — versioning and tracking published artifacts.
- `dataset-versioning` — dataset revisions, splits, and reproducibility.
- `llm-inference` / `vllm` — serving a downloaded model.
- `secret-management` — handling `HF_TOKEN` without leaking it.
