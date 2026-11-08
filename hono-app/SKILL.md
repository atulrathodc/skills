---
name: hono-app
description: Build, run, and debug Hono apps — ultrafast, lightweight web framework for Node.js, Bun, Deno, and Cloudflare Workers with TypeScript, middleware, and RPC.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# Hono App

Hono web framework specifics (cross-runtime, fast, typed).

0. **Greenfield Scaffolding** — For a new Hono project:
   `npm create hono@latest . -- --template nodejs && npm install`
   Or for Cloudflare Workers:
   `npm create hono@latest . -- --template cloudflare-workers && npm install`

1. **Bootstrap** — Entry point imports `Hono`:
   ```typescript
   import { Hono } from 'hono';
   const app = new Hono();
   ```
   For Node.js, serve with `@hono/node-server`:
   ```typescript
   import { serve } from '@hono/node-server';
   serve({ fetch: app.fetch, port: Number(process.env.PORT) || 3000 });
   ```

2. **Context `c` & Responses**:
   - JSON: `return c.json({ status: "ok", data })`
   - Text: `return c.text("Hello")`
   - Status code: `return c.json({ error: "Not found" }, 404)`
   - Parameters: `c.req.param("id")`, query: `c.req.query("search")`
   - Body: `await c.req.json()`

3. **Middleware** — Built-in middleware from `hono/cors`, `hono/logger`, `hono/pretty-json`:
   ```typescript
   import { cors } from 'hono/cors';
   import { logger } from 'hono/logger';
   app.use('*', logger());
   app.use('/api/*', cors());
   ```

4. **Validation** — Use `@hono/zod-validator` (`zValidator`):
   ```typescript
   import { zValidator } from '@hono/zod-validator';
   import { z } from 'zod';
   app.post('/api/users', zValidator('json', z.object({ name: z.string() })), (c) => {
     const data = c.req.valid('json');
     return c.json(data, 201);
   });
   ```

5. **Sub-routing & Grouping** — Create sub-apps:
   ```typescript
   const api = new Hono();
   api.get('/items', (c) => c.json([]));
   app.route('/api', api);
   ```

6. **Verify** — `npm run dev` or `npm run build && node dist/index.js`. Verify with `curl -i http://localhost:3000/api/...` confirming headers, JSON response, and status codes.
