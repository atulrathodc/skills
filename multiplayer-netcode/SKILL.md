---
name: multiplayer-netcode
description: Build and debug real-time multiplayer — authoritative server, client prediction and reconciliation, interpolation, tick/send rates, latency and loss handling, and cheat surfaces.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# Multiplayer Netcode

Every networked game has the same problem: the player's input is old by the time the world responds. Decide how you hide that, explicitly.

1. **The server is authoritative — clients send input, never state** — a client that reports "I am at (x, y)" is a client that can teleport. Send the input (or the intent), simulate on the server, and treat client positions as requests.
2. **Predict locally, then reconcile** — apply the local player's input immediately so it feels responsive, keep the unacknowledged inputs, and on each server snapshot re-simulate from the acknowledged state. Without reconciliation the player rubber-bands; with it, they feel a small correction instead of a delay.
3. **Interpolate other players, don't extrapolate blindly** — render remote entities ~100 ms in the past, interpolating between received snapshots. Extrapolation looks smooth until a player changes direction, then snaps.
4. **Pick tick rate and send rate separately** — simulate at a fixed rate (see `game-loop-and-ecs`), send snapshots at a lower rate, and delta-compress them. Sending every tick on every entity is how a small game bills like a large one.
5. **Only send what the player may know** — interest management (area of interest) is both bandwidth control and anti-cheat: hiding enemy positions server-side is the only real fog of war. Assume any data sent to a client will be read by the client.
6. **Design for latency, jitter, and loss, in numbers** — test at 200 ms with 5% loss as a baseline, not as an edge case. A dropped packet must be recoverable (reliable-ordered for state changes, unreliable for positions) and a late packet must not rewind newer state.
7. **Server time is the only clock** — never trust client timestamps for ordering or cooldowns; sync an offset and use server time for anything authoritative.
8. **Rate-limit and validate** — clamp movement speed, cap input frequency, reject impossible actions, and never let an input stream authorize a purchase or a state change. Log the rejections, they are your cheat telemetry.
9. **Reconnect is a feature, not an error path** — the input stream plus authoritative state lets a client rejoin mid-match; decide up front whether a disconnect forfeits, pauses, or hands control to AI, and make the other players see something sensible.
10. **Verify with a simulated bad network and two real clients** — throttle and add loss in devtools or with `tc netem`, then confirm the two clients agree on the outcome, that no one rubber-bands at rest, and that killing and reconnecting a client mid-match leaves a consistent world (`game-verification`). One client is not a multiplayer test.

## Related skills

- `websocket-realtime` / `webrtc-realtime` — the transports underneath (WebRTC gives you unreliable datagrams; WebSocket does not).
- `game-loop-and-ecs` / `game-physics` — deterministic simulation is what makes reconciliation possible.
- `resilience` / `error-handling` — retries, timeouts, and degraded states.
- `llm-security` — the general principle that client input is untrusted, applied to cheats.
