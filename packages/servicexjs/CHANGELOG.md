# servicexjs

## 0.3.0

### Minor Changes

- a18556b: Adopt JSON-RPC 2.0 protocol standard

  - RPC request/response types now follow JSON-RPC 2.0 spec (jsonrpc, id fields)
  - Add standard error codes (ErrorCodes) with JSON-RPC 2.0 integer codes
  - Add DOMAIN_ERROR_CODE_MAP for mapping DomainError to JSON-RPC error codes
  - Add ERROR_HTTP_STATUS_MAP for mapping error codes to HTTP status
  - Add ServiceSchema/MethodSchema types for rpc.describe support
  - Export JSONRPC_VERSION constant

### Patch Changes

- Updated dependencies [a18556b]
  - @servicexjs/core@0.3.0

## 0.2.0

### Minor Changes

- aa0d500: Initial release — platform-agnostic DDD service framework

  - Fluent API: `createService().rpc().register().run(runtime)`
  - Domain primitives: Entity, ValueObject, Id, DomainError hierarchy
  - DI container hidden behind `register(ctx, env)` declarative API
  - DrizzleRepository base class with upsert save, findById, delete
  - Node.js runtime adapter with Hono RPC endpoint, JWT auth, error mapping
  - Typed events: PlatformEvent, createEvent

### Patch Changes

- Updated dependencies [aa0d500]
  - @servicexjs/core@0.2.0
