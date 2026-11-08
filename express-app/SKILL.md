---
name: express-app
description: Build, run, and debug Express.js (Node) web servers and REST APIs — routing, middleware chains, async handlers, error handling, CORS, and body parsing.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# Express.js App

Express.js (Node.js) specifics and best practices that trip up agents.

0. **Greenfield Scaffolding — ALWAYS use the official generator or canonical setup.**
   When creating a new Express app from scratch:
   `npx --yes express-generator . --no-view && npm install`
   Or for modern TypeScript Express:
   `npm init -y && npm install express dotenv cors && npm install -D typescript @types/express @types/node @types/cors tsx`
   Never hand-craft 20 config files from memory without running `npm install`.

1. **Bootstrap & Server Lifecycle** — Create app with `const app = express();`. Always read the port from `process.env.PORT || 3000`. Listen with `app.listen(PORT, () => console.log(...))`.

2. **Middleware Order Matters** — Body parsers (`express.json()`, `express.urlencoded({ extended: true })`) and `cors()` MUST be registered BEFORE routes. A `req.body` that is `undefined` means body-parsing middleware was placed after the route or missing entirely.

3. **Routing & Sub-Routers** — Group routes into modular routers: `const router = express.Router();` in `routes/<resource>.js` and mount with `app.use('/api/v1/<resource>', router)`. Export `router` or `app`.

4. **Async Handlers & Error Handling** — In Express 4, unhandled promise rejections in `async (req, res, next) => {}` crash the process unless wrapped in a `try/catch` calling `next(err)` or using `express-async-errors`. (Express 5 handles promise rejections natively).

5. **Centralized Error Middleware** — Error middleware MUST declare exactly 4 arguments: `(err, req, res, next)`. If it declares only 3 arguments, Express treats it as normal middleware and misses errors. Place error handlers LAST, after all routes:
   ```javascript
   app.use((err, req, res, next) => {
     const status = err.status || err.statusCode || 500;
     res.status(status).json({ error: err.message || 'Internal Server Error' });
   });
   ```

6. **Environment & Security** — Use `dotenv.config()` at the entry point. Add `helmet` for HTTP headers. Avoid hardcoding database URLs or secrets in source code.

7. **Verify & Test** — Start the server in the background, curl the health endpoint (`curl -i http://localhost:3000/api/health`), test a POST with JSON payload, and verify error responses return expected HTTP status codes.
