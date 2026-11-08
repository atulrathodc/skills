---
name: dropwizard-app
description: Build, scaffold, run, and verify Dropwizard Java applications — Jersey REST resources, Jackson serialization, Configuration YAML, Health Checks, and Metrics.
allowed-tools:
  - Bash
  - Read
  - Grep
  - Glob
  - Edit
  - Write
  - List
---

# Dropwizard Application Engineering

Battle-tested, production-ready REST framework uniting Jetty, Jersey, Jackson, and Dropwizard Metrics.

---

## 1. Architecture Overview

A Dropwizard application consists of four core elements:

1. **`Configuration` class**: POJO that parses YAML configuration files into strongly-typed Java properties.
2. **`Application<T extends Configuration>`**: The main entry point initializing bundles and environment settings.
3. **`Environment`**: The runtime registry where Jersey resources, health checks, and managed services are registered.
4. **Health Checks**: Mandatory health check indicators exposed automatically on the admin port.

---

## 2. Configuration Class & YAML

### Configuration Class (`AppConfiguration.java`):
```java
package com.example;

import io.dropwizard.core.Configuration;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotEmpty;

public class AppConfiguration extends Configuration {

    @NotEmpty
    private String defaultName = "Stranger";

    @JsonProperty
    public String getDefaultName() {
        return defaultName;
    }

    @JsonProperty
    public void setDefaultName(String name) {
        this.defaultName = name;
    }
}
```

### Config File (`config.yml`):
```yaml
defaultName: World
server:
  applicationConnectors:
    - type: http
      port: 8080
  adminConnectors:
    - type: http
      port: 8081
```

---

## 3. Jersey Resource (REST Endpoint)

```java
package com.example.resources;

import com.example.api.Greeting;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import java.util.concurrent.atomic.AtomicLong;

@Path("/greet")
@Produces(MediaType.APPLICATION_JSON)
public class GreetingResource {
    private final String template;
    private final AtomicLong counter = new AtomicLong();

    public GreetingResource(String template) {
        this.template = template;
    }

    @GET
    public Greeting sayHello(@QueryParam("name") String name) {
        final String value = String.format(template, (name != null) ? name : "World");
        return new Greeting(counter.incrementAndGet(), value);
    }
}
```

---

## 4. Mandatory Health Check

Dropwizard encourages operational readiness by enforcing health checks.

```java
package com.example.health;

import com.codahale.metrics.health.HealthCheck;

public class TemplateHealthCheck extends HealthCheck {
    private final String template;

    public TemplateHealthCheck(String template) {
        this.template = template;
    }

    @Override
    protected Result check() {
        if (!template.contains("%s")) {
            return Result.unhealthy("template doesn't include a name format");
        }
        return Result.healthy();
    }
}
```

---

## 5. Main Application Entry Point

```java
package com.example;

import com.example.health.TemplateHealthCheck;
import com.example.resources.GreetingResource;
import io.dropwizard.core.Application;
import io.dropwizard.core.setup.Bootstrap;
import io.dropwizard.core.setup.Environment;

public class App extends Application<AppConfiguration> {

    public static void main(String[] args) throws Exception {
        new App().run(args);
    }

    @Override
    public String getName() {
        return "dropwizard-demo";
    }

    @Override
    public void initialize(Bootstrap<AppConfiguration> bootstrap) {
        // Initialize bundles (e.g., MigrationsBundle, AssetsBundle)
    }

    @Override
    public void run(AppConfiguration configuration, Environment environment) {
        final GreetingResource resource = new GreetingResource("Hello, %s!");
        final TemplateHealthCheck healthCheck = new TemplateHealthCheck("Hello, %s!");

        environment.healthChecks().register("template", healthCheck);
        environment.jersey().register(resource);
    }
}
```

---

## 6. Build, Run & Verification Lifecycle

- **Compile**:
  `mvn compile -q`
- **Build Shaded Fat Jar**:
  `mvn package`
- **Run Server**:
  `java -jar target/dropwizard-app-1.0.0-SNAPSHOT.jar server config.yml`
- **Test Application Endpoint**:
  `curl http://localhost:8080/greet`
- **Test Admin / Health Endpoints**:
  `curl http://localhost:8081/healthcheck`
  `curl http://localhost:8081/metrics`

---

## 7. Common Pitfalls

1. **Split Ports**: Dropwizard binds application traffic to port `8080` and operational / admin traffic to port `8081` by default. Don't query `/healthcheck` on port 8080.
2. **Missing Shaded Jar**: If `mvn package` doesn't generate a fat JAR with the `Main-Class` manifest, ensure `maven-shade-plugin` is configured in `pom.xml`.
3. **Missing Health Check Registration**: Always register at least one `HealthCheck` in `Environment`, otherwise Dropwizard prints a warning on startup.
