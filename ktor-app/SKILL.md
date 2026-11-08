---
name: ktor-app
description: Build, run, and debug Ktor (Kotlin) asynchronous web applications and microservices — routing, coroutines, content negotiation, serialization, and Netty engine.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# Ktor (Kotlin) App

Ktor specifics (Kotlin, coroutines, Netty, lightweight async).

0. **Greenfield Scaffolding**:
   Scaffold using Gradle with `io.ktor` plugins and dependencies in `build.gradle.kts`.

1. **Application Engine & Routing**:
   ```kotlin
   package com.example

   import io.ktor.server.application.*
   import io.ktor.server.engine.*
   import io.ktor.server.netty.*
   import io.ktor.server.response.*
   import io.ktor.server.routing.*

   fun main() {
       embeddedServer(Netty, port = 8080) {
           routing {
               get("/api/health") {
                   call.respond(mapOf("status" to "ok"))
               }
           }
       }.start(wait = true)
   }
   ```

2. **Content Negotiation & JSON**:
   - Install `ContentNegotiation` with `json()`:
     ```kotlin
     install(ContentNegotiation) {
         json()
     }
     ```

3. **Status Pages (Error Handling)**:
   - Install `StatusPages` plugin to intercept exceptions globally and return JSON error responses.

4. **Build & Verify**:
   - Build: `./gradlew build`
   - Run: `./gradlew run`
   - Test: `curl -i http://localhost:8080/api/health`.
