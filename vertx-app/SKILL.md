---
name: vertx-app
description: Build, scaffold, run, and verify Eclipse Vert.x reactive applications — Netty event loop, Verticles, Router, asynchronous non-blocking handlers, Future/Promise composition, and EventBus messaging.
allowed-tools:
  - Bash
  - Read
  - Grep
  - Glob
  - Edit
  - Write
  - List
---

# Eclipse Vert.x Reactive Application Engineering

Event-driven, non-blocking, lightweight reactive toolkit for the JVM built on Netty.

---

## 1. Canonical Greenfield Scaffolding

Generate clean, idiomatic Vert.x architecture using the official Vert.x Starter API:

```bash
# Generate Maven project with vertx-web and JUnit 5 test integration
curl -s "https://start.vertx.io/starter.zip?dependencies=vertx-web,vertx-unit" -o starter.zip \
  && unzip -qo starter.zip \
  && rm -f starter.zip
```

---

## 2. The Golden Rule of Vert.x

> [!CAUTION]
> **NEVER BLOCK THE EVENT LOOP.**
> Never execute `Thread.sleep()`, synchronous JDBC calls, CPU-heavy cryptographic loops, or blocking file I/O on an event loop thread. If blocking operations are unavoidable, wrap them in `vertx.executeBlocking(...)` or use the worker pool.

---

## 3. Main Verticle Pattern

Verticles are deployed into the Vert.x instance to handle events asynchronously:

```java
package com.example.starter;

import io.vertx.core.AbstractVerticle;
import io.vertx.core.Promise;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.Router;
import io.vertx.ext.web.RoutingContext;
import io.vertx.ext.web.handler.BodyHandler;

public class MainVerticle extends AbstractVerticle {

    @Override
    public void start(Promise<Void> startPromise) throws Exception {
        Router router = Router.router(vertx);

        // Body handler is required to parse POST/PUT JSON request bodies
        router.route().handler(BodyHandler.create());

        // Health check endpoint
        router.get("/health").handler(ctx -> {
            ctx.response()
                .putHeader("content-type", "application/json")
                .end(new JsonObject().put("status", "UP").encode());
        });

        // REST API routes
        router.get("/api/messages").handler(this::handleGetMessages);
        router.post("/api/messages").handler(this::handlePostMessage);

        int port = config().getInteger("http.port", 8080);
        vertx.createHttpServer()
            .requestHandler(router)
            .listen(port)
            .onSuccess(server -> {
                System.out.println("HTTP server started on port " + server.actualPort());
                startPromise.complete();
            })
            .onFailure(startPromise::fail);
    }

    private void handleGetMessages(RoutingContext ctx) {
        JsonArray messages = new JsonArray()
            .add(new JsonObject().put("id", 1).put("text", "Hello from Vert.x!"));
        ctx.response()
            .putHeader("content-type", "application/json")
            .end(messages.encode());
    }

    private void handlePostMessage(RoutingContext ctx) {
        JsonObject body = ctx.body().asJsonObject();
        if (body == null || !body.containsKey("text")) {
            ctx.response().setStatusCode(400).end("Missing text parameter");
            return;
        }
        JsonObject created = new JsonObject()
            .put("id", System.currentTimeMillis())
            .put("text", body.getString("text"));
        ctx.response()
            .setStatusCode(201)
            .putHeader("content-type", "application/json")
            .end(created.encode());
    }
}
```

---

## 4. Build, Run & Verification Lifecycle

- **Compile**:
  `./mvnw compile -q`
- **Run Unit/Verticle Tests**:
  `./mvnw test`
- **Run Development Server**:
  `./mvnw compile exec:java`
- **Package Fat Jar**:
  `./mvnw package`
- **Run Production Jar**:
  `java -jar target/*-fat.jar`

---

## 5. Async Composition with `Future` & `Promise`

Chain asynchronous operations using `.compose()` and `.onSuccess()` / `.onFailure()`:

```java
public Future<JsonObject> fetchUserData(String userId) {
    return databaseClient.query(userId)
        .compose(user -> enrichmentService.enrich(user))
        .map(enriched -> new JsonObject().put("user", enriched));
}
```

---

## 6. Testing Vert.x Verticles (JUnit 5 + VertxExtension)

```java
package com.example.starter;

import io.vertx.core.Vertx;
import io.vertx.junit5.VertxExtension;
import io.vertx.junit5.VertxTestContext;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import static org.junit.jupiter.api.Assertions.assertTrue;

@ExtendWith(VertxExtension.class)
public class TestMainVerticle {

    @BeforeEach
    void deploy_verticle(Vertx vertx, VertxTestContext testContext) {
        vertx.deployVerticle(new MainVerticle(), testContext.succeeding(id -> testContext.completeNow()));
    }

    @Test
    void verticle_deployed(Vertx vertx, VertxTestContext testContext) {
        testContext.completeNow();
    }
}
```

---

## 7. Common Pitfalls

1. **Forgetting `BodyHandler`**: If `BodyHandler.create()` is omitted from the router, `ctx.body().asJsonObject()` returns `null` because the HTTP request body stream is never consumed.
2. **Forgetting `ctx.response().end()`**: Unlike synchronous frameworks, returning from a handler does NOT close the HTTP connection. You must call `ctx.response().end()` or the client hangs indefinitely until timeout.
3. **Blocking JDBC Drivers**: Standard `java.sql.*` blocking JDBC calls freeze the event loop. Always use `vertx-pg-client`, `vertx-mysql-client`, or execute blocking queries within `vertx.executeBlocking()`.
