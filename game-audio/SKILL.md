---
name: game-audio
description: Game audio that works — autoplay policy and the user-gesture unlock, Web Audio vs streaming, scheduled playback, voice limits, music transitions, and memory.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# Game Audio

Audio is the subsystem that silently fails: no error, no sound, and a player who thinks the game is broken.

1. **Browsers block audio until a user gesture** — an `AudioContext` starts suspended; you must `resume()` it inside a real click/tap/keypress handler. "Sound works for me but not for players" is almost always this. Unlock once, on the first interaction, and show a muted state until you have.
2. **Web Audio for SFX, streaming for music** — decode small sounds into `AudioBuffer`s for immediate, low-latency playback; stream long music tracks (`<audio>`/`HTMLMediaElement`) rather than decoding a 5-minute file into memory.
3. **Schedule with the audio clock, not `setTimeout`** — `setTimeout` drifts and is throttled in background tabs. Use `ctx.currentTime + offset` for anything rhythmic or simultaneous.
4. **Cap simultaneous voices** — 50 overlapping explosion sounds clip the mix and cost more than they add. Limit concurrent instances per sound, steal the quietest/oldest, and fan out variations so repeats don't sound mechanical.
5. **Respect the pause and the tab** — mute or duck on pause/blur, and stop music that keeps playing behind the browser's tab-switch. Never let an audio context hold the game loop hostage.
6. **Mix with intent** — master/music/SFX buses with independent volume, a compressor on the master to prevent clipping, and headroom reserved so stacked SFX don't distort.
7. **Mind the decode cost and memory** — decoded PCM is roughly 10 MB per minute of stereo CD-quality audio. Prefer compressed formats, stream long tracks, and dispose buffers when a scene ends (`game-scene-state`).
8. **Audio latency is not zero** — figure in ~20–100 ms depending on platform; for rhythm-critical games you must measure and compensate rather than assume, and expose a calibration offset to the player.
9. **Verify on a fresh page with the console open** — confirm silence before the first click, sound after it, no console warnings about a suspended context, no clipping on ten simultaneous effects, and that pausing actually stops the music. Then listen on a phone at low volume, where mixing problems hide.

## Related skills

- `game-scene-state` — pause/duck semantics and disposing audio on scene exit.
- `game-assets-and-loading` — preloading and decoding audio without stalling the game.
- `game-verification` — the "no sound" and "sound after gesture" checks.
- `game-performance` — audio decode and voice-count costs inside the frame budget.
