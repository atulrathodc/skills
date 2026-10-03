---
name: openai-dots
description: OpenAI Dots (DevDay 2026) — what the always-on agents are, what they are not, the MCP-plugin integration path, Custom Rules and auto-review, irreversible memory/stop semantics, plan and region gates, and the sibling APIs (Agents, Decisions, Bedrock).
allowed-tools: Bash, Read, Grep, Glob, Edit, Write, web_search, web_fetch
---

# OpenAI Dots

Announced at DevDay on **2026-09-29**: always-on agents that keep working between conversations, each with its own cloud computer and browser, running on GPT-6 Astra and connecting to services through the existing ChatGPT plugin system. Facts here are dated — this surface changes weekly, so re-verify against OpenAI's docs and changelog before relying on any specific.

1. **A dot is a long-lived worker, not a call** — it has goals rather than a prompt, keeps notes across ChatGPT/Slack/Teams, and delegates heavy work to ChatGPT Work or Codex. Use one for open-ended, long-horizon, self-directed work; for a deterministic, repeatable decision or a fixed transformation use the API instead (a dot's value is judgment and persistence, not determinism).
2. **There is NO Dots API — do not invent one** — interaction is conversational (ChatGPT, Slack, Teams, voice). Any example you write for "calling a dot" must be instructions a human pastes into that chat, not a code snippet. If a task assumes a Dots endpoint or SDK, stop and correct the premise.
3. **The developer path is an MCP plugin** — to let a dot use YOUR system, expose an MCP server and connect it through ChatGPT's documented developer-mode flow (`Settings → Security and login → Developer mode`, then `chatgpt.com/plugins` → new plugin → Connection: your MCP server URL including the `/mcp` path + auth). Build and test that server standalone FIRST (`mcp-servers`); OpenAI flags developer mode as elevated risk specifically because of prompt injection and model mistakes on write actions.
4. **Grant least privilege, at the action level** — plugin permissions are granular (read email without sending, for example). Start read-only, and remember every connected app becomes material the dot may read in the background. Connect only what you would let it read.
5. **Custom Rules are the policy layer — and they are bounded** — `Settings → Personalization → Custom rules` (under Permissions) sets four behaviors: act without asking, act when told, ask first, or hand off to you. Rules cannot grant app/computer access, cannot override built-in safety, cannot remove required confirmations, and cannot relax auto-review or proactive-research restrictions — and a workspace admin can disable them.
6. **Auto-review is always on and cannot be switched off** — a separate check against your instructions, permissions, rules, and OpenAI's safety requirements decides run / ask / hand off / block. Fixed classes (password changes, money transfers) always need you; deleting data or installing software may need per-action approval; purchases need approval unless specifically pre-authorized. Design the workflow on the assumption that some steps WILL stop for a human.
7. **Proactive research is read-only by design** — while idle it reads permitted apps and takes private notes, but its research tools cannot message people, change your content, or drive a browser or computer. Acting on a finding goes through normal approvals. Do not assume "it can act when I'm not looking" for anything consequential.
8. **Keep task chains short** — OpenAI's own numbers show scope violations rising from ~8.6% with five intervening tasks to ~19.7% with ten. Prefer many small, verified steps over one long autonomous chain, and re-check the state of the world between steps.
9. **Memory is opaque and effectively irreversible** — three sources (working context, ChatGPT memory, its own notes). You cannot view, correct, or delete individual dot memories; **deleting the dot is the only reset**, and disconnecting a plugin stops future access without erasing what it already learned. Nothing that touches secrets, regulated data, or anything you cannot re-derive belongs in its reach.
10. **Know what stop actually stops** — Pause halts the current main task but not necessarily delegated tasks or scheduled runs; Stop does not undo completed actions; Delete removes the dot and its context but leaves files, Codex threads, ChatGPT conversations, sent messages, and app changes in place. There is no global undo — verify with the dot's Activity view before assuming a task is contained.
11. **Plan, region, and quota gates** — rollout is ChatGPT Pro ($100/$200/$500) for 18+ users outside the EEA, UK, and Switzerland, plus Business Premium; Enterprise/Edu/Healthcare are a beta an admin must enable (`Workspace settings → Permissions & roles → Use dots`, with Slack participation, custom rules, and local computer access as separate permissions). Talking to a dot does not consume ChatGPT usage limits, but the Work/Codex tasks it starts do.
12. **Enterprise caveats before you build on it** — during beta there is no data residency and no zero-data-retention, only admin-managed remote MCP hooks are supported, and cloud orchestration events do not reach OpenTelemetry collectors — plan your own audit trail. Check the admin controls (Compliance API, Analytics API) against your requirements before a rollout.

## Sibling APIs from the same DevDay (do not confuse them)

- **Agents API with computer use** — OpenAI hosts the loop; your agent drives software through its interface in a managed sandbox with a hosted browser (public beta). This is the programmatic path for "do it without an API"; a dot is the end-user path.
- **Decisions API** — constrained answers from a fixed list over **GPT-6 Luna** (classification, routing, next-action). It launched in **limited preview** and, as of 2026-09-30, had **no public docs, OpenAPI entry, or SDK method** — pricing, limits, and whether a confidence field is returned were all unpublished. Do not write code against an invented payload; confirm the real contract first, and include an explicit abstention answer in your choice set. It is the direct competitor to `jev-ai`.
- **Bedrock Managed Agents** — the Agents API core running natively in AWS (limited preview), for teams that must keep inference and data inside their AWS account.
- **Codex Security Cloud** — repo scanning plus prepared fixes; **GPT-6.1 Sol** (`gpt-6.1-sol`) is the cheap tier (~1.05M context, 128k output, $2/$10 per 1M tokens, $0.10 cached input; requests past 272k tokens bill higher).

## Verify

- Before claiming a capability: cite an OpenAI doc/changelog URL **and a date**, or say the fact is unverified. Availability, hooks, and permissions moved during rollout week and will move again.
- For an integration: prove the MCP server round-trips a real `tools/call` on its own, confirm the plugin appears in the dot's tools, verify a write action actually stops for approval, and read the dot's Activity view to confirm what ran.
- Never let a model verdict be the sole authorization for a destructive action — the approval layer is the control, and it is enforced outside your code (`agent-engineering`, `prompt-injection`).

## Related skills

- `mcp-servers` — building and testing the server a dot connects to.
- `computer-use` / `browser-agents` — the capability class a dot wraps, and its managed-sandbox sibling.
- `jev-ai` / `jev-ai-integration` — the decision-model alternative to the Decisions API.
- `agent-engineering` / `agent-memory` — bounded loops, memory design, and why opaque memory matters.
- `prompt-injection` / `llm-security` / `secret-management` — connected apps, write actions, and what must stay out of reach.
- `new-technology-adoption` — dating and sourcing claims about a surface this young.
