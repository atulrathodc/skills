---
name: input-validation
description: Validate every input at the boundary — API bodies, query params, config, user data — before it touches business logic.
allowed-tools: Read, Grep, Glob, Edit, Write
---

# Input Validation

Never trust input from outside the process. Validate at the boundary, once, with a clear error.

1. **Validate where input ENTERS** — a request handler / controller / CLI argument — not deep in a service. The boundary returns a clear 4xx/validation error; the internals assume valid data.
2. **Check the essentials:**
   - **Required vs optional** — a missing required field is a 400, not a null-deref later.
   - **Type + format** — number vs string, email/date/url shape, max length.
   - **Bounds** — negative price, empty string, oversized payload (a giant body is often an attack).
   - **Enum/whitelist** — status/role/category from a known set; reject anything else.
3. **Use the framework's validation** — Spring `@Valid` + `@NotBlank`/`@Email`, FastAPI/pydantic models, express-validator/zod. A schema/annotation both documents and enforces.
4. **Error shape** — return WHICH field failed and why (`{"errors":{"email":"must be a valid email"}}`) so the frontend can show it (see `frontend-backend-integration`).
5. **Server-side is mandatory** — client-side validation is UX, not security. The API must re-validate everything.
6. **Sanitize, don't trust** — escape/parameterize for SQL/queries (never string-concatenate), and treat file paths from input as untrusted (see `security-review`).
7. Test the boundary with a bad payload — a 400 with a clear message is the deliverable.
