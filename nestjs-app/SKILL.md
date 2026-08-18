---
name: nestjs-app
description: Build, run, and debug NestJS (Node) apps — modules/controllers/providers, decorators, DI, validation pipes.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# NestJS App

NestJS (Node, structured) specifics.

1. **Structure** — a feature = a `Module` + `Controller` + `Provider` (service). A controller method that 404s = the route isn't registered in a module that's imported into `app.module`.
2. **Decorators** — `@Controller('users')`, `@Get(':id')`, `@Body()`, `@Param('id')`, `@Query()`. Return values serialize to JSON automatically.
3. **DI** — providers are injected via constructor (see `dependency-injection`). A "Nest can't resolve dependencies of X" error means the provider isn't in `providers:`/`@Module`, or it has its own missing dependency — fix the module wiring.
4. **Validation** — `class-validator` DTOs + `ValidationPipe` (global): `@IsString()`, `@IsInt()`. A 400 with no detail = the pipe isn't enabled or the DTO has no decorators (see `input-validation`).
5. **Bootstrap** — `main.ts` has `app.listen(process.env.PORT ?? 3000)`; enable `ValidationPipe`/`Cors` there (see `frontend-backend-integration`).
6. **Run** — `npm run start:dev` (watch), `npm run build` + `start:prod`. Verify with curl (see `make-it-run`, `http-api-testing`).
