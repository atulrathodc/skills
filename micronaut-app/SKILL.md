---
name: micronaut-app
description: Build, scaffold, run, and verify Micronaut Java applications — launch.micronaut.io generator, compile-time DI, Micronaut Data repositories, controllers, and GraalVM AOT compilation.
allowed-tools:
  - Bash
  - Read
  - Grep
  - Glob
  - Edit
  - Write
  - List
---

# Micronaut Application Engineering

Modern, JVM-based, full-stack microservice framework with compile-time dependency injection and zero reflection overhead.

---

## 1. Canonical Greenfield Scaffolding

Generate clean project architecture using the official Micronaut Launch API:

```bash
# Generate Maven project with HTTP server and Jackson support
curl -s "https://launch.micronaut.io/create/default/demo?lang=JAVA&build=MAVEN&features=http-client,data-jpa,h2" -o micronaut.zip \
  && unzip -qo micronaut.zip \
  && (cp -rn demo/* . 2>/dev/null || cp -r demo/* .) \
  && rm -rf demo micronaut.zip
```

Or via Micronaut CLI:
```bash
mn create-app demo --build=maven --lang=java --features=http-client,data-jpa,h2
```

---

## 2. Build & Run Lifecycle

- **Compile & Validate Beans**:
  `./mvnw compile -q` (Micronaut's annotation processor validates bean wiring at compile time).
- **Run Tests**:
  `./mvnw test`
- **Run in Development**:
  `./mvnw mn:run` (or `./mvnw exec:exec`)
- **Package Shaded Fat Jar**:
  `./mvnw package`
- **Execute Production Jar**:
  `java -jar target/demo-0.1.jar`

---

## 3. Configuration (`src/main/resources/application.yml`)

```yaml
micronaut:
  application:
    name: demo
  server:
    port: 8080

datasources:
  default:
    url: jdbc:h2:mem:devDb;LOCK_TIMEOUT=10000;DB_CLOSE_ON_EXIT=FALSE
    driverClassName: org.h2.Driver
    username: sa
    password: ''
    schema-generate: CREATE_DROP
```

---

## 4. Micronaut Controllers

```java
package demo.controller;

import io.micronaut.http.HttpResponse;
import io.micronaut.http.HttpStatus;
import io.micronaut.http.annotation.*;
import jakarta.validation.Valid;
import java.util.List;

@Controller("/api/todos")
public class TodoController {

    private final TodoRepository repository;

    // Micronaut uses constructor injection by default
    public TodoController(TodoRepository repository) {
        this.repository = repository;
    }

    @Get
    public List<Todo> listAll() {
        return repository.findAll();
    }

    @Get("/{id}")
    public HttpResponse<Todo> getById(@PathVariable Long id) {
        return repository.findById(id)
                .map(HttpResponse::ok)
                .orElse(HttpResponse.notFound());
    }

    @Post
    public HttpResponse<Todo> create(@Body @Valid Todo todo) {
        Todo saved = repository.save(todo);
        return HttpResponse.created(saved);
    }
}
```

---

## 5. Micronaut Data Repository

Micronaut Data precomputes SQL queries at compile time with zero runtime reflection.

```java
package demo.controller;

import io.micronaut.data.annotation.GeneratedValue;
import io.micronaut.data.annotation.Id;
import io.micronaut.data.annotation.MappedEntity;
import io.micronaut.data.jdbc.annotation.JdbcRepository;
import io.micronaut.data.model.query.builder.sql.Dialect;
import io.micronaut.data.repository.CrudRepository;

import java.util.List;

@MappedEntity
public class Todo {
    @Id
    @GeneratedValue
    private Long id;
    private String title;
    private boolean completed;

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public boolean isCompleted() { return completed; }
    public void setCompleted(boolean completed) { this.completed = completed; }
}

@JdbcRepository(dialect = Dialect.H2)
public interface TodoRepository extends CrudRepository<Todo, Long> {
    List<Todo> findAll();
    List<Todo> findByCompleted(boolean completed);
}
```

---

## 6. Testing with `@MicronautTest`

```java
package demo;

import io.micronaut.http.HttpRequest;
import io.micronaut.http.client.HttpClient;
import io.micronaut.http.client.annotation.Client;
import io.micronaut.test.extensions.junit5.annotation.MicronautTest;
import jakarta.inject.Inject;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

@MicronautTest
public class TodoControllerTest {

    @Inject
    @Client("/")
    HttpClient client;

    @Test
    void testListTodos() {
        HttpRequest<String> request = HttpRequest.GET("/api/todos");
        String body = client.toBlocking().retrieve(request);
        assertNotNull(body);
    }
}
```

---

## 7. Common Pitfalls

1. **Compile-Time DI Errors**: A missing dependency causes `NoSuchBeanException` during compilation rather than runtime. Ensure classes are annotated with `@Singleton`, `@Controller`, or `@Repository`.
2. **Missing Introspection**: Non-entity DTOs passed in request/response bodies require `@Introspected` or `@Serdeable` for compile-time Jackson serialization.
3. **Lombok with Micronaut**: If using Lombok, Lombok's annotation processor must precede Micronaut's annotation processor in `pom.xml`.
