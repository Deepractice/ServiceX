# @servicexjs/node

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
