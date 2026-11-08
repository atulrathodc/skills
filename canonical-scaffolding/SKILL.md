---
name: canonical-scaffolding
description: Run official framework generators and CLIs for greenfield projects (Next.js, React, Vue, Svelte, Astro, NestJS, Express, FastAPI, Django, Flask, Spring Boot, Cargo, Go). Use whenever creating or bootstrapping a new project or app from scratch.
allowed-tools:
  - Bash
  - Read
  - Glob
  - Write
---

# Canonical Framework Scaffolding

Never hallucinate 20–25 interdependent configuration files (`package.json`, `tsconfig.json`, `vite.config.ts`, `tailwind.config.ts`, etc.) from memory for greenfield projects. Hand-crafted boilerplates fail on the first attempt due to version drift, missing peer dependencies, and uninstalled `node_modules`.

Always invoke the battle-tested official CLI generator via Bash first.

## Official Generator Matrix

| Framework / Stack | Canonical CLI Command | Verification Command |
| :--- | :--- | :--- |
| **Next.js** (App Router + TS + Tailwind) | `npx --yes create-next-app@latest . --typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*" --use-npm --disable-git --yes` | `npm run build` |
| **React** (Vite + TS) | `npx --yes create-vite@latest . --template react-ts --no-interactive --overwrite && npm install` | `npm run build` |
| **Vue** (Vite + TS) | `npx --yes create-vite@latest . --template vue-ts --no-interactive --overwrite && npm install` | `npm run build` |
| **Svelte** (Vite + TS) | `npx --yes create-vite@latest . --template svelte-ts --no-interactive --overwrite && npm install` | `npm run build` |
| **Astro** | `npx --yes create-astro@latest . --template minimal --typescript strict --install --no-git --yes` | `npm run build` |
| **NestJS** | `npx --yes @nestjs/cli new . --skip-git --package-manager npm` | `npm run build` |
| **Express** | `npx --yes express-generator . --no-view && npm install` | `node -c app.js` |
| **FastAPI** | Scaffold `main.py` + `requirements.txt` (`fastapi`, `uvicorn[standard]`) | `python3 -m py_compile main.py` |
| **Django** | `django-admin startproject config . \|\| python3 -m django startproject config .` | `python3 manage.py check` |
| **Flask** | Scaffold `app.py` + `requirements.txt` (`flask`) | `python3 -m py_compile app.py` |
| **Spring Boot** | `curl -s https://start.spring.io/starter.zip -d dependencies=web,actuator -d type=maven-project -d language=java -o starter.zip && unzip -qo starter.zip && rm -f starter.zip` | `./mvnw compile -q \|\| mvn compile -q` |
| **Hono** (Node / Workers) | `npm create hono@latest . -- --template nodejs && npm install` | `npm run build \|\| node -c src/index.ts` |
| **Remix / React Router** | `npx --yes create-remix@latest . --template remix-run/remix/templates/remix --no-install && npm install` | `npm run build` |
| **Ruby on Rails** | `rails new . --api --database=sqlite3 --skip-git` | `bin/rails db:migrate:status` |
| **Laravel** (PHP) | `composer create-project laravel/laravel .` | `php artisan route:list` |
| **Gin** (Go) | `go mod init <name> && go get -u github.com/gin-gonic/gin` | `go build ./...` |
| **Fiber** (Go) | `go mod init <name> && go get github.com/gofiber/fiber/v2` | `go build ./...` |
| **Tauri** (Rust + Web) | `npm create tauri-app@latest . -- --template react-ts --manager npm` | `cargo check --manifest-path src-tauri/Cargo.toml` |
| **Electron** | `npm init -y && npm install -D electron` | `node -c main.js` |
| **Expo** (React Native) | `npx --yes create-expo-app@latest . --template blank-typescript --no-install && npm install` | `npx tsc --noEmit` |
| **ASP.NET Core** (.NET / C#) | `dotnet new webapi -n <name> -o .` | `dotnet build` |
| **Ktor** (Kotlin) | Gradle setup with `io.ktor` server plugins | `./gradlew build` |
| **Qwik** | `npm create qwik@latest . -- --template basic && npm install` | `npm run build` |
| **Rust** | `cargo init --name <name>` | `cargo build` |
| **Go** | `go mod init <name>` | `go build ./...` |

## Non-Empty Directory Stashing

CLIs like `create-next-app` will abort if non-essential files (like a starter `README.md` or `.gitkeep`) already exist in the target directory.
1. Stash existing non-essential files to a temporary directory outside the workspace (`/tmp/...`).
2. Run the canonical CLI generator.
3. Restore any non-conflicting stashed files.
4. Verify the baseline build passes (`npm run build` or framework equivalent) before developing custom features.
