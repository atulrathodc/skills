---
name: laravel-app
description: Develop, run, and debug Laravel (PHP) web apps and APIs — Artisan CLI, Eloquent ORM, routes, controllers, migrations, and middleware.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# Laravel (PHP) App

Laravel specifics (PHP, MVC, Eloquent ORM, Artisan).

0. **Greenfield Scaffolding** — For a new Laravel project:
   `composer create-project laravel/laravel .`
   Ensure `.env` exists with `APP_KEY` set (`php artisan key:generate`).

1. **Routing** — Routes live in `routes/`:
   - `routes/web.php` for session-based web views.
   - `routes/api.php` for stateless JSON REST APIs.
   - Inspect routes: `php artisan route:list`.

2. **Controllers & Validation**:
   - Generate controller: `php artisan make:controller Api/PostController --api`.
   - Validate incoming requests:
     ```php
     $validated = $request->validate([
         'title' => 'required|string|max:255',
         'content' => 'required|string',
     ]);
     ```
   - Return JSON: `return response()->json($post, 201);`.

3. **Eloquent ORM & Migrations**:
   - Generate model + migration: `php artisan make:model Post -m`.
   - Run migrations: `php artisan migrate`.
   - Models live in `app/Models/Post.php`. Define `$fillable` array for mass assignment.

4. **Server & Configuration**:
   - Local dev server: `php artisan serve --port=8000`.
   - Clear caches when config changes: `php artisan config:clear && php artisan route:clear`.

5. **Verify** — Start server (`php artisan serve`), curl endpoints, and run automated tests with `php artisan test`.
