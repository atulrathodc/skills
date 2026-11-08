---
name: helidon-app
description: Build, scaffold, run, and verify Oracle Helidon microservices — Helidon SE reactive webserver, Helidon MP (MicroProfile), Config, Health, and Metrics.
allowed-tools:
  - Bash
  - Read
  - Grep
  - Glob
  - Edit
  - Write
  - List
---

# Oracle Helidon Application Engineering

Cloud-native, lightweight set of Java libraries for writing microservices.

---

## 1. Flavors: Helidon SE vs Helidon MP

Helidon offers two distinct programming styles:

1. **Helidon SE (Reactive / Functional)**:
   - Compact, fast, non-blocking toolkit based on virtual threads and functional routing.
   - Transparent with zero "magic" or reflection overhead.
2. **Helidon MP (MicroProfile / Declarative)**:
   - Eclipse MicroProfile standards: CDI (`@ApplicationScoped`), JAX-RS (`@Path`), JSON-B/JSON-P.
   - Familiar annotations for developers coming from Spring Boot or Jakarta EE.

---

## 2. Canonical Greenfield Scaffolding

### Helidon SE:
```bash
mvn archetype:generate -B \
  -DarchetypeGroupId=io.helidon.archetypes \
  -DarchetypeArtifactId=helidon-quickstart-se \
  -DarchetypeVersion=4.0.7 \
  -DgroupId=com.example \
  -DartifactId=quickstart-se \
  -Dpackage=com.example
```

### Helidon MP:
```bash
mvn archetype:generate -B \
  -DarchetypeGroupId=io.helidon.archetypes \
  -DarchetypeArtifactId=helidon-quickstart-mp \
  -DarchetypeVersion=4.0.7 \
  -DgroupId=com.example \
  -DartifactId=quickstart-mp \
  -Dpackage=com.example
```

---

## 3. Helidon SE Minimal Server Pattern

Helidon 4.x runs on Java 21+ using Virtual Threads.

```java
package com.example;

import io.helidon.webserver.WebServer;
import io.helidon.webserver.http.HttpRouting;
import io.helidon.webserver.http.ServerRequest;
import io.helidon.webserver.http.ServerResponse;

public class Main {

    public static void main(String[] args) {
        WebServer server = WebServer.builder()
            .port(8080)
            .routing(Main::routing)
            .build();

        server.start();
        System.out.println("Helidon server started at http://localhost:" + server.port());
    }

    static void routing(HttpRouting.Builder routing) {
        routing
            .get("/health", (req, res) -> res.send("{\"status\": \"UP\"}"))
            .get("/api/greet", Main::handleGreet);
    }

    private static void handleGreet(ServerRequest req, ServerResponse res) {
        String name = req.query().first("name").orElse("World");
        res.header("Content-Type", "application/json");
        res.send("{\"message\": \"Hello, " + name + "!\"}");
    }
}
```

---

## 4. Configuration (`src/main/resources/application.yaml`)

```yaml
server:
  port: 8080
  host: 0.0.0.0

app:
  greeting: "Hello from Helidon"
```

---

## 5. Build & Run Lifecycle

- **Compile**:
  `mvn compile -q`
- **Run Tests**:
  `mvn test`
- **Package Application**:
  `mvn package`
- **Run Jar**:
  `java -jar target/quickstart-se.jar`
- **Verify**:
  `curl http://localhost:8080/api/greet`

---

## 6. Common Pitfalls

1. **Java Version Requirements**: Helidon 4 requires Java 21+ (leveraging Java Virtual Threads / Project Loom). If running on Java 17, use Helidon 3.x.
2. **Helidon SE vs MP Mix-ups**: Do not attempt to use `@Inject` or `@Path` in a Helidon SE application; SE does not use a CDI container.
