---
name: jax-rs-servlet
description: Build, run, and debug JAX-RS / servlet (Java EE) web apps — @Path endpoints, web.xml, WAR deployment on Tomcat/Jetty.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# JAX-RS / Servlet App

Legacy-but-alive Java web: JAX-RS (`@Path`/`@GET`) and plain servlets, deployed as a WAR.

1. **Endpoints** — JAX-RS: `@Path("/api")` on a class + `@GET`/`@POST`/`@PathParam`; register via `@ApplicationPath` on an `Application` subclass. Servlet: `HttpServlet` + `@WebServlet("/path")` overriding `doGet`/`doPost`.
2. **Packaging** — a WAR goes in `src/main/webapp/`; build with `mvn package` (or `mvn war:war`). `web.xml` (or annotations) declare servlets/filters. Deploy by dropping the WAR into Tomcat's `webapps/`.
3. **Run** — `mvn tomcat7:run` / `mvn jetty:run` (dev) or deploy to an installed Tomcat/Jetty and access `http://localhost:<port>/<context>/<path>`. The CONTEXT PATH matters — a 404 is often a missing context prefix.
4. **JSON** — JAX-RS uses Jackson/JAXB: `@Produces("application/json")` + return a POJO (getters required). A blank body = no getters or no JSON provider on the classpath.
5. **Filters** — servlet `Filter` for auth/logging/CORS; misordered or missing filters cause the classic "works locally, 401 in the WAR" (see `authentication`).
6. **Verify** — deploy/run, curl the context path + endpoint (see `http-api-testing`); check the servlet container's log for the FIRST error.
