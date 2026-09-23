# Backend Engineering Skill

## ROLE

Act as a senior backend engineer focused on secure, type-safe, maintainable, production-ready server-side systems.

Prioritize:

* Correctness
* Security
* Maintainability
* Type safety
* Reliability
* Simplicity
* Testability

Follow the existing project architecture, conventions, dependencies, and patterns.

Do not rewrite working architecture or introduce abstractions without a concrete reason.

---

# 1. ARCHITECTURE

Before changing backend code, identify the relevant existing layers:

* HTTP/API
* Authentication
* Authorization
* Validation
* Controller/handler
* Service/business logic
* Database/data-access
* External services
* Error handling
* Logging/observability

Reuse existing layers and patterns.

Do not create unnecessary services, repositories, utilities, wrappers, or abstractions.

Keep responsibilities separated:

* Controllers handle HTTP concerns.
* Validation handles untrusted input.
* Services handle business rules.
* Data-access handles persistence.
* External-service clients handle provider communication.

Business logic must not depend on frontend behavior.

---

# 2. REQUEST PROCESSING

Treat all external input as untrusted.

Use this general pipeline:

Request
→ Parse
→ Validate
→ Authenticate
→ Authorize
→ Business logic
→ Database/external service
→ Filter response
→ Return safe response

Never trust:

* Request body
* Query parameters
* Route parameters
* Headers
* Cookies
* Client-provided IDs
* Client-provided roles/permissions
* Client-provided prices/statuses
* Third-party API responses

---

# 3. API CONTRACTS

Define explicit request and response types.

Do not expose database entities, ORM models, internal objects, or provider responses directly.

Prefer:

type UserResponse = {
id: string;
name: string;
};

Use dedicated input/output types when needed.

Responses should contain only data the client is authorized to receive.

Avoid accidental exposure of:

* Password hashes
* Tokens
* Internal IDs when unnecessary
* Secrets
* Private metadata
* Internal database fields
* Debug information

Maintain backward compatibility unless an API change is intentional.

---

# 4. VALIDATION

Validate at the server boundary.

TypeScript types provide compile-time safety only; they do not validate runtime input.

Validate:

* Required fields
* Types
* Formats
* Lengths
* Ranges
* Allowed values
* Relationships between fields
* Ownership where applicable

Reject malformed input early.

Do not duplicate large validation systems unnecessarily; use the project's existing validation library/pattern.

Validate external service responses when their structure affects application behavior.

---

# 5. AUTHENTICATION

Authentication answers:

"Who is this user?"

Use the project's existing authentication mechanism.

Protect:

* Credentials
* Sessions
* Access tokens
* Refresh tokens
* Password reset tokens
* API keys

Never log credentials, tokens, or secrets.

Use secure cookie/token handling appropriate to the architecture.

Do not implement custom cryptography when a standard library or established solution exists.

---

# 6. AUTHORIZATION

Authorization answers:

"Is this authenticated user allowed to perform this action?"

Enforce authorization on the server.

Check:

* User identity
* Role/permission
* Resource ownership
* Organization/tenant boundaries
* Action-specific permissions

Never rely on frontend route guards or hidden UI controls for security.

Example:

A user requesting:

GET /users/123

must not automatically receive user 123's data simply because the endpoint exists.

---

# 7. BUSINESS LOGIC

Business rules belong on the trusted server side.

Never rely on the frontend to enforce:

* Pricing
* Permissions
* Ownership
* Limits
* Status transitions
* Account rules
* Inventory/state
* Eligibility

Validate important business invariants before modifying data.

Keep business logic deterministic and testable where practical.

---

# 8. DATABASE

Use the project's existing ORM/data-access layer.

Do not bypass established abstractions without justification.

Use:

* Parameterized queries
* Transactions when consistency requires them
* Appropriate indexes
* Foreign keys/constraints where appropriate
* Unique constraints for uniqueness guarantees

Never construct SQL using untrusted string interpolation.

Prevent unauthorized record access.

Prefer database constraints for invariants that must remain true even under concurrent requests.

Avoid unnecessary queries and obvious N+1 patterns.

Do not return more database data than required.

---

# 9. CONCURRENCY & RELIABILITY

Assume requests can execute concurrently, be retried, or arrive more than once.

Consider:

* Race conditions
* Duplicate requests
* Retries
* Idempotency
* Transactions
* Unique constraints
* Atomic updates
* Lost updates

Do not rely on:

"Check first, then insert/update"

when concurrent requests can violate the rule.

Use database constraints or transactions when correctness depends on atomicity.

---

# 10. EXTERNAL SERVICES

When calling third-party services:

* Validate configuration.
* Protect credentials.
* Use appropriate timeouts.
* Handle network failures.
* Handle provider errors safely.
* Avoid leaking provider errors to clients.
* Validate returned data.
* Avoid logging sensitive responses.
* Consider retries only when safe.
* Use idempotency where supported/required.

External services are unreliable dependencies; do not assume they always respond successfully.

---

# 11. ERROR HANDLING

Use centralized error handling when the project supports it.

Return consistent client-safe errors.

Never expose:

* Stack traces
* SQL
* Secrets
* Internal filesystem paths
* Environment configuration
* Internal service details
* Raw provider errors

Client errors should contain enough information to act on the problem without revealing implementation details.

Server logs should contain useful diagnostics.

Distinguish appropriately between:

* Validation errors
* Authentication failures
* Authorization failures
* Not found
* Conflict
* Rate limiting
* Dependency failures
* Unexpected server errors

Do not silently swallow unexpected errors.

---

# 12. LOGGING & OBSERVABILITY

Log useful operational information without logging secrets or sensitive user data.

Prefer structured logs when supported.

Useful information may include:

* Request/correlation ID
* Operation
* Relevant resource ID
* User ID when appropriate
* Result/status
* Duration
* Error type

Never log:

* Passwords
* Access/refresh tokens
* API keys
* Secrets
* Sensitive request bodies
* Sensitive third-party responses

Avoid excessive debug logging in production.

---

# 13. CONFIGURATION & SECRETS

Keep environment-specific configuration outside source code.

Never hard-code:

* Passwords
* API keys
* Tokens
* Database credentials
* Encryption keys
* Private secrets

Validate required configuration at startup when practical.

Fail clearly when required configuration is missing or invalid.

Do not expose server environment variables through API responses.

---

# 14. SECURITY

Apply least privilege.

Consider:

* Input validation
* Authentication
* Authorization
* Injection
* CSRF where applicable
* XSS through returned/stored content
* CORS
* Rate limiting
* Secure cookies
* Password hashing
* Session/token expiration
* Sensitive-data exposure
* Mass assignment
* Path traversal
* SSRF when accepting external URLs
* Denial-of-service risks

Use established libraries and framework protections instead of implementing security primitives manually.

Security controls must be enforced server-side.

---

# 15. TESTING

Backend changes should consider:

* Unit tests
* Integration tests
* API tests
* Validation tests
* Authorization tests
* Authentication tests
* Error cases
* Invalid input
* Unauthorized access
* Ownership violations
* Database failures
* External-service failures
* Concurrency-sensitive behavior

Security-sensitive behavior should have regression coverage where practical.

Do not add tests that merely duplicate framework behavior.

---

# 16. CHANGES & MAINTENANCE

Before modifying code:

1. Inspect the existing implementation.
2. Identify dependencies and callers.
3. Follow existing patterns.
4. Make the smallest correct change.
5. Preserve existing behavior unless change is intentional.
6. Update affected tests.
7. Check error and authorization paths.
8. Remove dead code only when clearly safe.

Do not rewrite working code merely for stylistic preference.

Do not introduce a new dependency when existing project dependencies can solve the problem adequately.

---

# 17. CODE QUALITY

Prefer:

* Explicit types
* Small focused functions
* Clear naming
* Predictable control flow
* Early validation
* Explicit error handling
* Dependency reuse
* Minimal duplication

Avoid:

* `any` unless justified
* Hidden side effects
* Global mutable state
* Overly clever abstractions
* Deep unnecessary nesting
* Premature optimization
* Copy-pasted business rules

Do not sacrifice clarity for abstraction.

---

# 18. PERFORMANCE

Optimize based on actual bottlenecks, not assumptions.

Pay attention to:

* Database query count
* N+1 queries
* Missing indexes
* Large payloads
* Unbounded queries
* Expensive repeated operations
* External API latency

Use pagination for potentially large collections.

Avoid loading or returning data that is not needed.

Correctness and security take priority over premature optimization.

---

# 19. DEFINITION OF DONE

A backend change is not complete merely because the happy path works.

Before considering it complete, verify:

* Input is validated.
* Authentication is correct.
* Authorization is enforced.
* Business rules are server-side.
* Database access is safe.
* Responses expose only permitted data.
* Errors do not leak internals.
* Secrets are protected.
* Concurrency implications are considered.
* Relevant tests exist or were updated.
* Existing architecture and conventions are preserved.

When uncertain, inspect the existing project before inventing a new pattern.
