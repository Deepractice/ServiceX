# ServiceX

Platform-agnostic DDD service framework. Define services once, run anywhere.

## Packages

| Package | Description |
|---------|-------------|
| `servicexjs` | Fluent API for creating services |
| `@servicexjs/core` | Domain primitives, DrizzleRepository, types |
| `@servicexjs/node` | Node.js runtime adapter (dev & testing) |

## Quick Start

```bash
bun add servicexjs @servicexjs/core @servicexjs/node
```

### Define a Service

```typescript
import { createService } from "servicexjs";
import { Entity, Id, injectable, inject, DrizzleRepository } from "@servicexjs/core";
import { node } from "@servicexjs/node";

// 1. Domain — define your entity
class Tenant extends Entity<string> {
  readonly name: string;

  private constructor(id: string, name: string) {
    super(id);
    this.name = name;
  }

  static create(name: string): Tenant {
    return new Tenant(Id.generate("tnt"), name);
  }

  static reconstitute(id: string, name: string): Tenant {
    return new Tenant(id, name);
  }
}

// 2. Repository — extend DrizzleRepository
@injectable()
class TenantRepo extends DrizzleRepository<Tenant, typeof tenants> {
  constructor(@inject("DB") db: any) {
    super(db, tenants);
  }

  protected toEntity(row: any): Tenant {
    return Tenant.reconstitute(row.id, row.name);
  }

  protected toRow(entity: Tenant) {
    return { id: entity.id, name: entity.name };
  }
}

// 3. Service — business logic
@injectable()
class TenantService {
  constructor(@inject("TenantRepo") private repo: TenantRepo) {}

  async create(name: string) {
    const tenant = Tenant.create(name);
    await this.repo.save(tenant);
    return tenant;
  }

  async get(id: string) {
    return this.repo.findById(id);
  }
}

// 4. Wire it up — createService().rpc().register().run()
export default createService("tenant")
  .register((ctx, env) => {
    ctx.value("DB", env.DB);
    ctx.bind("TenantRepo", TenantRepo);
    ctx.bind("TenantService", TenantService);
  })
  .rpc({
    "tenant.create": async (params, ctx) => {
      const svc = ctx.resolve<TenantService>("TenantService");
      return svc.create(params.name);
    },
    "tenant.get": async (params, ctx) => {
      const svc = ctx.resolve<TenantService>("TenantService");
      return svc.get(params.id);
    },
  })
  .run(node({ port: 3000 }));
```

### Call the Service

```bash
# RPC request format
curl -X POST http://localhost:3000/api/rpc \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"method": "tenant.create", "params": {"name": "My Team"}}'

# Response
# { "result": { "id": "tnt_m1abc_x7f3k2p1", "name": "My Team" } }
```

## Architecture

```
createService("name")           ← servicexjs (fluent API)
  .register(...)                ← DI registration (platform-agnostic)
  .rpc({ ... })                 ← RPC method declarations
  .run(node({ port: 3000 }))   ← bind to runtime, start service
        │
        ├── @servicexjs/node       (open source, dev & testing)
        └── your-cloud-runtime     (your own adapter for production)
```

### Core Concepts

**ServiceContainer** — defines what a service IS (dependencies + RPC methods), without coupling to any platform.

**Runtime** — decides HOW to run it (Node.js, Cloudflare Workers, AWS Lambda, etc.). Runtimes implement the `Runtime<T>` interface from `@servicexjs/core`.

**Everything before `.run()` is platform-agnostic.** Switch runtimes by changing one line.

## API Reference

### `servicexjs`

```typescript
createService(name: string): ServiceBuilder
```

Returns a fluent builder:

| Method | Description |
|--------|-------------|
| `.rpc(methods)` | Declare RPC method handlers |
| `.register(fn)` | Declare dependency registration |
| `.publicMethods(list)` | Declare unauthenticated methods |
| `.run(runtime)` | Bind to a platform runtime |

### `@servicexjs/core`

**Domain:**

| Export | Description |
|--------|-------------|
| `Entity<T>` | Base class for domain entities |
| `ValueObject<T>` | Base class for value objects |
| `Id.generate(prefix)` | Generate prefixed unique IDs |
| `DomainError` | Base domain error |
| `ValidationError` | 400 — invalid input |
| `AuthenticationError` | 401 — not authenticated |
| `ForbiddenError` | 403 — not authorized |
| `NotFoundError` | 404 — entity not found |
| `ConflictError` | 409 — duplicate/conflict |

**Repository:**

| Export | Description |
|--------|-------------|
| `Repository<T>` | Interface — findById, save, delete |
| `DrizzleRepository<T, Table>` | Base class with upsert save, findById, delete |

**Decorators:**

| Export | Description |
|--------|-------------|
| `@injectable()` | Mark a class for DI resolution |
| `@inject(token)` | Inject a dependency by token |
| `@singleton()` | Mark as singleton |

**Types:**

| Export | Description |
|--------|-------------|
| `Runtime<T>` | Interface for platform runtime adapters |
| `RpcContext` | Context passed to RPC handlers (auth, resolve, env) |
| `AuthContext` | Authenticated user info (userId, tenantId, email) |
| `PlatformEvent<Type, Payload>` | Event contract for cross-service messaging |
| `createEvent(type, payload)` | Helper to create typed events |

### `@servicexjs/node`

```typescript
node(config?: NodeConfig): Runtime<{ app: Hono; port: number }>
```

| Option | Default | Description |
|--------|---------|-------------|
| `port` | `3000` | Port to listen on |
| `auth.secret` | `"dev-secret"` | JWT secret for dev/test |
| `auth.cookieName` | `"session"` | Session cookie name |
| `env` | `{}` | Environment variables to inject |
| `basePath` | `"/api"` | API route prefix |

### RPC Method Handler

```typescript
type RpcMethodHandler = (params: any, ctx: RpcContext) => Promise<any>;

interface RpcContext {
  auth: AuthContext;                    // authenticated user
  resolve<T>(token: string): T;        // resolve dependency
  env: Record<string, unknown>;        // platform environment
}
```

### Custom Runtime Adapter

Implement `Runtime<T>` to create your own platform adapter:

```typescript
import type { Runtime, ServiceDefinition } from "@servicexjs/core";

function myRuntime(config: MyConfig): Runtime<MyOutput> {
  return {
    create(definition: ServiceDefinition): MyOutput {
      // 1. Create ServiceContainerImpl and initialize with env
      // 2. Wire up HTTP server with definition.methods
      // 3. Handle auth for non-public methods
      // 4. Map DomainErrors to HTTP status codes
      // 5. Return platform-specific output
    },
  };
}
```

## License

MIT
