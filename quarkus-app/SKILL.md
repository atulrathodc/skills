---
name: quarkus-app
description: Build, scaffold, run, and verify Quarkus Java applications — code.quarkus.io generator, dev mode, RESTEasy Reactive, Panache ORM, DevServices, and native image compilation.
allowed-tools:
  - Bash
  - Read
  - Grep
  - Glob
  - Edit
  - Write
  - List
---

# Quarkus Application Engineering

Supersonic Subatomic Java — Fast startup, low memory footprint, and Kubernetes-native development.

---

## 1. Canonical Greenfield Scaffolding

Scaffold official production baseline using the Quarkus API:

```bash
# Generate Quarkus project with RESTEasy Reactive Jackson and SmallRye OpenAPI
curl -s "https://code.quarkus.io/api/download?g=org.acme&a=code-with-quarkus&e=resteasy-reactive,resteasy-reactive-jackson" -o quarkus.zip \
  && unzip -qo quarkus.zip \
  && (cp -rn code-with-quarkus/* . 2>/dev/null || cp -r code-with-quarkus/* .) \
  && rm -rf code-with-quarkus quarkus.zip
```

Alternatively, use the Quarkus CLI if installed:
```bash
quarkus create app --extension=resteasy-reactive-jackson .
```

---

## 2. Dev Mode & Build Lifecycle

- **Dev Mode (Live Reload & Zero Restart)**:
  `./mvnw quarkus:dev` (runs on `http://localhost:8080` with hot-reload enabled).
- **Compile & Verify**:
  `./mvnw compile -q`
- **Run Tests**:
  `./mvnw test`
- **Package JVM Runner Jar**:
  `./mvnw package` (generates `target/quarkus-app/quarkus-run.jar`).
- **Run Shaded/Fast-Jar**:
  `java -jar target/quarkus-app/quarkus-run.jar`
- **Native Executable (GraalVM)**:
  `./mvnw package -Dnative` (requires local GraalVM or Docker container).

---

## 3. Configuration (`src/main/resources/application.properties`)

```properties
# HTTP Port
quarkus.http.port=8080

# Panache & Hibernate ORM
quarkus.datasource.db-kind=h2
quarkus.datasource.jdbc.url=jdbc:h2:mem:quarkusdb
quarkus.hibernate-orm.database.generation=drop-and-create
quarkus.hibernate-orm.log.sql=true

# Dev Services automatically provision test DB containers in dev mode if docker is running
quarkus.devservices.enabled=true
```

---

## 4. RESTEasy Reactive Endpoints

Quarkus uses non-blocking RESTEasy Reactive by default.

```java
package org.acme.controller;

import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.List;

@Path("/api/products")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class ProductResource {

    @GET
    public Response getAll() {
        return Response.ok(ProductEntity.listAll()).build();
    }

    @GET
    @Path("/{id}")
    public Response getById(@PathParam("id") Long id) {
        ProductEntity entity = ProductEntity.findById(id);
        if (entity == null) {
            throw new WebApplicationException("Product not found", Response.Status.NOT_FOUND);
        }
        return Response.ok(entity).build();
    }

    @POST
    public Response create(ProductEntity product) {
        product.persist();
        return Response.status(Response.Status.CREATED).body(product);
    }
}
```

---

## 5. Hibernate with Panache (Active Record & Repository)

### Option A: Active Record (`PanacheEntity`)
```java
package org.acme.model;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.Entity;

@Entity
public class ProductEntity extends PanacheEntity {
    public String name;
    public Double price;

    public static ProductEntity findByName(String name) {
        return find("name", name).firstResult();
    }
}
```

### Option B: Repository Pattern (`PanacheRepository<T>`)
```java
package org.acme.repository;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import org.acme.model.Product;

@ApplicationScoped
public class ProductRepository implements PanacheRepository<Product> {
    public Product findByName(String name) {
        return find("name", name).firstResult();
    }
}
```

---

## 6. Testing with `@QuarkusTest`

```java
package org.acme;

import io.quarkus.test.junit.QuarkusTest;
import org.junit.jupiter.api.Test;
import static io.restassured.RestAssured.given;
import static org.hamcrest.CoreMatchers.is;

@QuarkusTest
public class ProductResourceTest {

    @Test
    public void testGetProductsEndpoint() {
        given()
          .when().get("/api/products")
          .then()
             .statusCode(200);
    }
}
```

---

## 7. Common Pitfalls

1. **JAX-RS Annotation Confusion**: Always import `jakarta.ws.rs.*` annotations (`@Path`, `@GET`, `@Produces`), never legacy `javax.ws.rs.*`.
2. **Missing Transaction on Writes**: In Panache, state modifications (`persist()`, `delete()`) require an active transaction: annotate the method or class with `@Transactional` (from `jakarta.transaction.Transactional`).
3. **DevServices Port Contention**: If Docker daemon is unavailable, set `quarkus.devservices.enabled=false` and configure an in-memory H2 URL.
