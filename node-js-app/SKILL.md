---
name: node-js-app
description: Create and run Node.js apps — package.json, scripts, ESM/CJS, express or built-in http, port, npm run.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# Node.js App

The Node lifecycle that gets a JS app running.

1. **package.json first** — `npm init -y` if none. Define the `start` script (`node server.js`). `"type": "module"` for ESM `import`; omit for CJS `require`.
2. **HTTP server** — for zero-dependency apps use the built-in `node:http` (`createServer`). For routes, `express` (`npm install express`).
3. **Read the port from the environment** — `process.env.PORT ?? 3000`, then `server.listen(port)`. Log the actual port.
4. **Install** — `npm install` (with the lockfile if present). If install fails, see `dependency-install-recovery`.
5. **Run in the background** — `node server.js` (or `npm start`) via `run_in_background:true`. Probe the port (see `make-it-run`, `http-api-testing`).
6. **Fix → restart** — kill the old node process (the port stays bound until it dies) before restarting, or it fails with `EADDRINUSE`.
7. Only `done()` when `curl` against the port returns the expected response.
