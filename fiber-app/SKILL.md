---
name: fiber-app
description: Develop, run, and debug Fiber (Go) web apps and APIs — high performance, Express-like routing, middleware, JSON binding, and zero-allocation handlers.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# Fiber (Go) App

Fiber specifics (Go, Express-inspired, built on Fasthttp).

0. **Greenfield Scaffolding**:
   ```bash
   go mod init <name>
   go get github.com/gofiber/fiber/v2
   ```

1. **Bootstrap & Server**:
   ```go
   package main

   import "github.com/gofiber/fiber/v2"

   func main() {
       app := fiber.New()
       app.Get("/api/health", func(c *fiber.Ctx) error {
           return c.JSON(fiber.Map{"status": "ok"})
       })
       app.Listen(":3000")
   }
   ```

2. **Context & Parsing**:
   - Parse body: `if err := c.BodyParser(&req); err != nil { return c.Status(400).JSON(fiber.Map{"error": err.Error()}) }`.
   - Route params: `c.Params("id")`, query params: `c.Query("page")`.
   - Return status + JSON: `return c.Status(fiber.StatusCreated).JSON(item)`.

3. **Built-in Middleware** — `github.com/gofiber/fiber/v2/middleware/logger`, `cors`, `recover`:
   ```go
   import (
       "github.com/gofiber/fiber/v2/middleware/cors"
       "github.com/gofiber/fiber/v2/middleware/logger"
       "github.com/gofiber/fiber/v2/middleware/recover"
   )
   app.Use(logger.New())
   app.Use(recover.New())
   app.Use(cors.New())
   ```

4. **Zero-Allocation String Pitfall**:
   - Values returned by `c.Params()`, `c.Query()`, and `c.Body()` point directly to the request buffer. If stored in a background goroutine, use `c.Params("id").Clone()` or `string([]byte(...))` to prevent memory corruption.

5. **Build & Verify**:
   - Compile: `go build ./...`
   - Test with curl: `curl -i http://localhost:3000/api/health`.
