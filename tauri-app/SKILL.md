---
name: tauri-app
description: Build, run, and debug Tauri cross-platform desktop and mobile apps — Rust backend, Web frontend, IPC commands, events, window management, and security permissions.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# Tauri App

Tauri specifics (Rust core + Web frontend, light footprint, secure).

0. **Greenfield Scaffolding**:
   `npm create tauri-app@latest . -- --template react-ts --manager npm`
   Or for vanilla/Vue/Svelte: pass `--template vue-ts` or `--template svelte-ts`.

1. **Structure**:
   - `src-tauri/` contains the Rust backend (`Cargo.toml`, `src/main.rs` or `src/lib.rs`, `tauri.conf.json`).
   - `src/` contains the web frontend (React, Vite, HTML/CSS/JS).

2. **IPC Commands (Rust → Frontend)**:
   - In Rust (`src-tauri/src/lib.rs`):
     ```rust
     #[tauri::command]
     fn greet(name: &str) -> String {
         format!("Hello, {}!", name)
     }
     ```
   - Register in `invoke_handler`: `tauri::generate_handler![greet]`.
   - In Frontend (`src/App.tsx`):
     ```typescript
     import { invoke } from "@tauri-apps/api/core";
     const response = await invoke<string>("greet", { name: "Mini" });
     ```

3. **Configuration & Permissions**:
   - `src-tauri/tauri.conf.json` defines window title, dimensions, bundle identifier, and dev server URL (`http://localhost:1420`).
   - In Tauri v2, permissions are strictly declared in `src-tauri/capabilities/default.json`.

4. **Build & Dev**:
   - Run dev: `npm run tauri dev`
   - Build desktop package: `npm run tauri build`
   - Verify frontend compiles: `npm run build`
   - Verify Rust compiles: `cargo check --manifest-path src-tauri/Cargo.toml`.
