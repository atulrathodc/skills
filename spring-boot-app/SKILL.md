---
name: spring-boot-app
description: Develop, scaffold, and verify Spring Boot applications — Spring Initializr, Maven/Gradle lifecycle, application.properties, JPA/Hibernate, H2, REST controllers, and Spring Security.
allowed-tools:
  - Bash
  - Read
  - Grep
  - Glob
  - Edit
  - Write
  - List
---

# Spring Boot Application Engineering

Essential patterns, lifecycle commands, and pitfalls when developing Spring Boot applications.

---

## 1. Canonical Greenfield Scaffolding

Never manually create a Maven project from memory. Always generate a production-ready baseline using the official Spring Initializr API:

```bash
# Generate Maven project with Web, Actuator, and Validation
curl -s "https://start.spring.io/starter.zip?dependencies=web,actuator,validation&type=maven-project&language=java&bootVersion=3.3.4" -o starter.zip \
  && unzip -qo starter.zip \
  && rm -f starter.zip
```

For applications needing persistence:
```bash
curl -s "https://start.spring.io/starter.zip?dependencies=web,actuator,data-jpa,h2,validation&type=maven-project&language=java" -o starter.zip \
  && unzip -qo starter.zip \
  && rm -f starter.zip
```

---

## 2. Build & Run Lifecycle

Always use the project wrapper script (`./mvnw` or `./gradlew`) when present to match the exact wrapper version:

- **Compile**: `./mvnw compile -q`
- **Run Unit/Integration Tests**: `./mvnw test`
- **Package Fat Jar**: `./mvnw package -DskipTests=false`
- **Run in Development**: `./mvnw spring-boot:run`
- **Run Shaded/Boot Jar**: `java -jar target/*.jar`

> [!NOTE]
> Spring Boot 3.x requires Java 17 or higher. All Java imports must use `jakarta.*` packages (`jakarta.persistence.*`, `jakarta.validation.*`, `jakarta.servlet.*`), NOT the legacy `javax.*` namespace.

---

## 3. Configuration & Ports

Configure `src/main/resources/application.properties` (or `application.yml`):

```properties
# Server Port
server.port=8080

# In-memory H2 Database configuration
spring.datasource.url=jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE
spring.datasource.driverClassName=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect
spring.jpa.hibernate.ddl-auto=update
spring.h2.console.enabled=true

# Actuator health endpoints
management.endpoints.web.exposure.include=health,info,metrics
```

---

## 4. REST Controller & Service Pattern

Always implement clean layer separation: `Controller` -> `Service` -> `Repository`.

```java
package com.example.demo.controller;

import com.example.demo.model.Item;
import com.example.demo.service.ItemService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/items")
public class ItemController {

    private final ItemService itemService;

    // Use constructor injection — avoids @Autowired field injection issues
    public ItemController(ItemService itemService) {
        this.itemService = itemService;
    }

    @GetMapping
    public List<Item> getAll() {
        return itemService.findAll();
    }

    @PostMapping
    public ResponseEntity<Item> create(@Valid @RequestBody Item item) {
        Item created = itemService.save(item);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
}
```

---

## 5. Spring Data JPA Repository

```java
package com.example.demo.repository;

import com.example.demo.model.Item;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ItemRepository extends JpaRepository<Item, Long> {
    Optional<Item> findByName(String name);
}
```

---

## 6. Global Error Handling (RFC 7807 ProblemDetail)

Spring Boot 3 natively supports RFC 7807 problem details:

```java
package com.example.demo.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(IllegalArgumentException.class)
    public ProblemDetail handleNotFound(IllegalArgumentException ex) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
    }
}
```

---

## 7. Critical Pitfalls & Troubleshooting

1. **Spring Security 401/403 Errors**:
   - If `spring-boot-starter-security` is on the classpath, ALL endpoints require authentication by default.
   - Configure a `SecurityFilterChain` bean permitting public routes or testing endpoints:
     ```java
     @Bean
     public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
         http.csrf(csrf -> csrf.disable())
             .authorizeHttpRequests(auth -> auth.requestMatchers("/api/**", "/actuator/**").permitAll().anyRequest().authenticated());
         return http.build();
     }
     ```
2. **H2 Database Lock (`database is already in use`)**:
   - A stale Java daemon holds the file lock.
   - Kill stale processes with `lsof -i :8080` or `pkill -f 'java.*spring'`, or switch to memory database `jdbc:h2:mem:...`.
3. **Port Conflicts**:
   - If port 8080 is in use, pass `--server.port=0` (ephemeral port) or set `SERVER_PORT=8081` in environment.
