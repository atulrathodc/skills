---
name: jev-ai-integration
description: Wire Jev (TypeSafe AI) into an app or service — one decide() boundary, schema design, API-key placement, latency budgets, batching, probability gating with fallbacks, caching, and regression tests.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# Jev AI Integration

`jev-ai` covers what Jev is. This covers how to put it in a real system without introducing a new class of outage. A decision model fails quietly — it returns a confident-looking answer, not an error.

1. **Put the decision behind ONE boundary** — a single `decideSomething(state)` function (or a thin internal service) that every caller goes through. When the schema, threshold, or vendor changes, you change one place instead of hunting scattered calls. Never inline `client.decide(...)` at call sites.
2. **The API key never reaches a client** — a mobile or web app cannot hold a `jev_…` key; anything shipped in a bundle is public. Proxy through your backend (the app calls your endpoint, your server calls Jev) and keep the key in the server environment or a secret manager (see `secret-management`). This is non-negotiable for React Native, Flutter, and any store-distributed app.
3. **Design the question set, not the prompt** — choices must be exhaustive AND mutually exclusive, and every decision gets an explicit abstention answer (`unknown`, `needs_review`, `escalate`). Without an escape hatch the model is forced to pick a wrong-but-valid label on inputs that fit none of them.
4. **Keep `state` minimal and purposeful** — send the fields that actually bear on the decision, not the whole record. Extra context degrades accuracy; pre-process images/audio/binary into text or typed fields before sending.
5. **Set a latency budget and honor it** — Jev returns in roughly 70–500 ms, so it can sit on a request path — but not in a per-item loop. Batch many small decisions (tagging/filtering N items) into one request instead of N calls.
6. **Never act on the answer alone — gate on the probability** — high `p` → act automatically; below your threshold → rules fallback, retry with better state, or route to a human. Choosing that threshold is a measurement problem, not a taste one: see `decision-model-evaluation`.
7. **Decide the failure path before launch** — a timeout, 5xx, or schema rejection must degrade to a deterministic path (existing rules, cached decision, human queue). For anything destructive or irreversible, the safe fallback is always "don't act" — never "assume yes" because the model was unavailable.
8. **Cache decisions by input hash** — keying on a hash of (state + questions + model version) removes duplicate calls, makes retries idempotent, and gives you a repeatable offline path. Record the `(answer, p, model version)` you acted on for every decision — you cannot debug or audit a decision you did not log.
9. **Treat `state` as untrusted input** — it may carry injected instructions from user content. Keep authorization and policy in application code; a model verdict is advice, not permission (see `prompt-injection`).
10. **Treat a schema change as a behavior change** — changing a choice set, wording, or `state` fields silently moves the decision boundary. Keep a versioned golden set of labeled examples and re-run it in CI: assert the response shape (every key present, declared type, `0 <= p <= 1`) AND accuracy against the labels. A green shape check with degraded accuracy is a regression you shipped.

## Related skills

- `jev-ai` — what the model is, the call shape, and the modes (`compaction`, `router`).
- `decision-model-evaluation` — picking the threshold and proving the accuracy before you gate on it.
- `function-calling` / `tool-use` — using a typed verdict to select and invoke a tool or branch.
- `secret-management` / `prompt-injection` — key placement and untrusted `state`.
- `resilience` / `error-handling` — the fallback path when the decision service is unavailable.
