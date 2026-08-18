---
name: fastify-app
description: Build, run, and debug Fastify (Node) apps — routes, plugins, schema validation, logger, port.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# Fastify App

Fastify (Node) specifics.

1. **Bootstrap** — `const app = Fastify({ logger: true }); await app.listen({ port })`. Read the port from `process.env.PORT`.
2. **Routes** — `app.get('/api/x', async (req, reply) => {...})`; async handlers that throw are turned into 500s — return a proper `reply.status(400).send(...)` for client errors.
3. **Validation** — Fastify validates from a JSON schema per route: `schema: { body: {...}, params: {...} }`. A 400 "body must be object" means the schema doesn't match the payload — fix the schema (see `input-validation`).
4. **Plugins** — `app.register(plugin, opts)` encapsulates scope; a route registered in the wrong scope (or a `fastify()` vs `app` misuse) yields "route not found".
5. **DI / decorators** — `app.decorate('db', client)` makes it available as `app.db` in handlers — the Fastify way to share the DB (see `dependency-injection`).
6. **Run** — `npm start` in background; verify with curl (see `make-it-run`, `http-api-testing`). The built-in logger prints requests + errors — read the FIRST error.
