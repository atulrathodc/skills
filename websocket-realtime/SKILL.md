---
name: websocket-realtime
description: Implement or fix realtime features — WebSocket/Socket.IO/SSE endpoints, the client connection, and why updates don't reach the browser.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# WebSocket / Realtime

Realtime updates need a persistent channel — and the failure is almost always on one side of the handshake.

1. **Find the channel** — Grep for `@MessageMapping`, `WebSocketHandler`, `socket.io`, `new WebSocket(`, `EventSource`, `Server-Sent Events`. Identify the endpoint + protocol (ws:// vs sse).
2. **Test the handshake first** — `curl` the upgrade endpoint (`curl -i -H "Connection: Upgrade" -H "Upgrade: websocket" ...`), or open a client and watch the connect. A failed handshake = nothing else works.
3. **Common causes:**
   - **Wrong URL** — `ws://` vs `http://` mismatch, missing path, or the frontend uses the API base instead of the socket URL.
   - **Proxy/CORS blocks it** — the reverse proxy/Vite proxy must pass `Upgrade` headers (see `react-frontend`, `frontend-backend-integration`).
   - **Event never published** — the server broadcasts to the wrong topic/channel, or after the event, not before.
   - **Client reconnection** — a dropped connection needs reconnect logic; a UI that only connects once goes stale after the first drop.
   - **Auth** — the socket handshake must carry the token (query param / header); a 401 on connect = auth (see `authentication`).
4. **Verify** — connect a real client, trigger the event on the server, and confirm the message arrives in the browser/console.
