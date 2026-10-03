---
name: react-native-state-and-data
description: React Native state, data fetching, caching, and offline persistence — server vs client state, race conditions, AsyncStorage vs MMKV vs SQLite, and reconnect handling.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# React Native State & Data

Mobile adds what the web doesn't have: a flaky network, a process that gets killed, and a device that is always on. State bugs here are usually persistence or race bugs.

1. **Separate server state from client state** — fetched data (cache, retry, dedupe, staleness) is not the same as UI state (form input, toggles). Use a query cache (TanStack Query or equivalent) for the former instead of hand-rolling `useEffect` + `useState` fetches, which have no cache, no dedupe, and no retry.
2. **Guard against out-of-order responses** — fast tab switching makes an older, slower response overwrite fresh data. Use the query library's keying, or an `AbortController`/request id you check before writing state. Symptom: "the list shows the wrong data after switching screens quickly".
3. **Context re-renders every consumer** — one big app context means every state change re-renders the whole tree. Split contexts by update frequency, and keep fast-changing values out of the top-level provider.
4. **Know your storage tiers** — `AsyncStorage` is async, unencrypted, and slow for large blobs (a JSON dump of thousands of rows will jank startup). Use MMKV for fast key/value, `expo-secure-store` / Keychain / Keystore for tokens, and SQLite (`expo-sqlite`, op-sqlite) when you need to query or paginate.
5. **Never put credentials in AsyncStorage** — it is plain text on disk and in backups. Tokens belong in the secure store; refresh tokens belong on the server when you can manage it.
6. **Define the offline behavior, don't discover it** — read connectivity with `@react-native-community/netinfo` / `expo-network`, show cached data with a clear stale/offline indicator, queue mutations, and reconcile (or roll back) on reconnect. Optimistic updates need an explicit failure path.
7. **A cache is not a source of truth** — version your persisted schema; when the shape changes, migrate or clear it, otherwise users on an old build read a payload your new code cannot parse. Gate cache reads behind a schema version.
8. **Verify with the app killed and the network off** — set airplane mode and confirm cached data + a real error state appear (not an infinite spinner); then kill and relaunch the app (`adb shell am force-stop <pkg>` / swipe-kill) and confirm a persisted value survives. A JS reload does NOT prove persistence.

## Related skills

- `react-native-verification` — the kill-the-app and airplane-mode checks belong to verification.
- `caching-strategies` / `state-management` — general patterns this skill specializes for mobile.
- `react-native-performance` — storage and re-render costs that show up as slow startup.
- `frontend-backend-integration` — when the data is wrong because the contract is wrong.
