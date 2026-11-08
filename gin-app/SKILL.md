---
name: gin-app
description: Develop, run, and debug Gin (Go) web applications and REST APIs — routing, middleware, binding, validation, error handling, and binary compilation.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# Gin (Go) App

Gin specifics (Go, high-performance HTTP framework).

0. **Greenfield Scaffolding**:
   ```bash
   go mod init <name>
   go get -u github.com/gin-gonic/gin
   ```

1. **Bootstrap & Server**:
   ```go
   package main

   import "github.com/gin-gonic/gin"

   func main() {
       r := gin.Default()
       r.GET("/api/health", func(c *gin.Context) {
           c.JSON(200, gin.H{"status": "ok"})
       })
       r.Run(":8080") // listens on 0.0.0.0:8080
   }
   ```

2. **Route Grouping & Middleware**:
   - Use groups for versioning: `api := r.Group("/api/v1")`.
   - Apply middleware to groups: `api.Use(AuthMiddleware(), LoggerMiddleware())`.
   - Pass context values: `c.Set("userID", id)` and `c.Get("userID")`.

3. **Request Binding & Validation**:
   - Use struct tags `json:"title" binding:"required"`:
     ```go
     type CreateItemRequest struct {
         Title string `json:"title" binding:"required"`
         Price float64 `json:"price" binding:"required,gt=0"`
     }
     ```
   - Bind JSON: `if err := c.ShouldBindJSON(&req); err != nil { c.JSON(400, gin.H{"error": err.Error()}); return }`.

4. **Build & Verify**:
   - Compile: `go build -o server .`
   - Run tests: `go test -v ./...`
   - Test with curl: `curl -i http://localhost:8080/api/health`.
