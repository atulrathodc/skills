---
name: background-jobs
description: Add or fix async background work — queues, scheduled/cron jobs, workers, and why a task "runs twice / never runs".
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# Background Jobs

Async work (emails, exports, scheduled cleanup) needs a queue or scheduler, not a blocking call.

1. **Find the current mechanism** — Grep for `cron`, `@Scheduled`, `setInterval`, `queue`, `bull`, `celery`, `rq`, `sidekiq`. Understand WHEN and WHERE the job runs.
2. **Pick the right primitive:**
   - **Scheduled** → `@Scheduled(cron=...)` (Spring), `node-cron`, `schedule` (Python), or the OS crontab.
   - **Queued** → a real queue (BullMQ, Celery, Sidekiq) + a worker process for long/retriable work.
   - **Simple** → a background thread/`setTimeout`/`asyncio.create_task` for fire-and-forget that must not block the request.
3. **Fix "never runs"** — the scheduler/worker process isn't started (start it, see `production-process`), the schedule expression is wrong, or the timezone is off.
4. **Fix "runs twice"** — duplicate workers subscribed to the same queue, or the job is enqueued on every request — make the enqueue idempotent (a job id / dedupe key).
5. **Fix "blocks the request"** — a slow job done synchronously in the request handler; move it to a queue/worker.
6. **Verify** — trigger the job, confirm it completes (check the worker log / a side effect row), and that the request returns fast.
