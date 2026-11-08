---
name: electron-app
description: Build, run, and debug Electron desktop apps — Main process, Renderer process, Preload scripts, contextBridge IPC, security sandboxing, and packaging.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# Electron App

Electron specifics (Node.js Main process + Chromium Renderer process).

0. **Greenfield Scaffolding**:
   `npm init -y && npm install electron --save-dev`
   Or with Vite template:
   `npm create @quick-start/electron@latest . -- --template react-ts`

1. **Process Architecture**:
   - **Main Process** (`main.js`): Controls app lifecycle, creates `BrowserWindow`, handles native OS menus and file dialogs.
   - **Preload Script** (`preload.js`): Secure bridge between main and renderer. Exposes APIs safely via `contextBridge.exposeInMainWorld`.
   - **Renderer Process** (`renderer.js` / React / Vite): Web UI running in browser sandbox.

2. **Security Invariants (Never bypass)**:
   - `nodeIntegration: false` (always keep false in webPreferences).
   - `contextIsolation: true` (always keep true).
   - Never expose raw `ipcRenderer` to window; expose specific typed functions:
     ```javascript
     // preload.js
     const { contextBridge, ipcRenderer } = require('electron');
     contextBridge.exposeInMainWorld('api', {
       openFile: () => ipcRenderer.invoke('dialog:openFile')
     });
     ```

3. **IPC Communication**:
   - Renderer → Main (two-way): `ipcRenderer.invoke('channel', args)` ↔ `ipcMain.handle('channel', async (event, args) => {})`.
   - Main → Renderer (one-way): `win.webContents.send('event-name', data)`.

4. **Verify & Run**:
   - In package.json set `"main": "main.js"` and `"scripts": { "start": "electron ." }`.
   - Verify script syntax: `node -c main.js && node -c preload.js`.
