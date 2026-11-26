---
name: desktop-web-app
description: Build, secure, debug, and package Electron and Tauri desktop applications — main/backend vs renderer process model, IPC security, contextIsolation, preload scripts, native menus/tray, file access, auto-update, and signing.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# Desktop Web App

Electron and Tauri pair a web UI with a privileged native host process. Most bugs and security holes live at the boundary between the two processes, or in packaging differences between dev mode and the bundled app.

1. **Keep the renderer untrusted and locked down** — in Electron, ALWAYS set `contextIsolation: true`, `nodeIntegration: false`, and `sandbox: true` on `BrowserWindow`, and never expose raw `ipcRenderer` to `window`. In Tauri v2, declare explicit capability/permission files (`src-tauri/capabilities/*.json`) with the narrowest scope possible rather than wildcarding `fs` or `shell`.
2. **Design IPC as a typed, minimal RPC surface** — expose only narrow, named commands through `contextBridge.exposeInMainWorld` (Electron) or `#[tauri::command]` (Tauri). Validate all arguments in the host process (paths, URLs, command args) — never accept arbitrary shell strings or unvalidated file paths from the renderer.
3. **Never block the main/host thread** — synchronous I/O (`fs.readFileSync`, heavy JSON parsing, SQLite queries) on Electron's main process freezes menus, tray icons, and every window. Use async APIs, Node `utilityProcess` / worker threads, or Rust async commands (`tokio::task::spawn_blocking`) for heavy work.
4. **Separate dev-server URLs from production asset loading** — in dev, the renderer loads `http://localhost:<port>`; in production, it loads bundled files (`file://` or custom protocol `app://` / `tauri://`). Relative asset paths, `fetch('/api/...')`, and SPA client-side routing (`BrowserRouter` vs `HashRouter`) frequently break in the packaged build even when dev works.
5. **Resolve app paths via OS APIs, never `__dirname` or `process.cwd()`** — packaged apps live in read-only locations (`/Applications/*.app`, `Program Files`, AppImage mounts). Store user data, SQLite DBs, and logs in `app.getPath('userData')` (Electron) or `app.path().app_data_dir()` (Tauri). Reference bundled static assets via `process.resourcesPath` / Tauri resource resolver.
6. **Handle window lifecycle and platform conventions explicitly** — on macOS, closing the last window usually keeps the app alive in the Dock (`window-all-closed` does not call `app.quit()`, and `activate` recreates the window), and native Edit menu shortcuts (Cmd+C/V/X/A) stop working in Electron if you replace the default menu without keeping standard `role` entries.
7. **Manage child processes and clean shutdown** — if the desktop app spawns a local backend/sidecar, bind it to `127.0.0.1` on an ephemeral port (or fixed port with conflict handling), pass an auth token if sensitive, and kill the child process tree in `before-quit` / `RunEvent::Exit` so orphaned servers do not linger after quit.
8. **Set a strict Content Security Policy (CSP)** — forbid `unsafe-eval`, restrict `connect-src` to known API/local origins, and open external links in the system browser (`shell.openExternal` after checking `url.protocol === 'https:'`) rather than letting clicks navigate the app window away.
9. **Test the packaged artifact, not just `npm run dev`** — run the real production pack (`electron-builder` / `electron-forge` / `tauri build`) and launch the built `.app`/`.exe`/`.AppImage`. Verify native modules (ABI rebuilt for Electron's Node version), bundled sidecars, icons, and auto-update manifest.
10. **Sign and notarize before distributing** — unsigned macOS builds hit Gatekeeper ("damaged and can't be opened") and unsigned Windows builds trigger SmartScreen. Wire signing/notarization into CI early (see `macos-app`).

## Related skills

- `macos-app` — macOS signing, notarization, TCC permissions, and App Sandbox rules.
- `react-frontend` — building the renderer UI cleanly.
- `rust-systems` — writing the Tauri Rust backend cleanly.
- `runtime-verification` — launching and verifying the packaged desktop binary.
- `secret-management` — storing signing certificates and notarization credentials.
