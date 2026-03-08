import type {
  ServiceDefinition,
  RegisterFn,
  Runtime,
  RpcMethods,
} from "@servicexjs/core";

// Re-export everything from core — users only need "servicexjs"
export {
  // Domain
  Entity,
  ValueObject,
  Id,
  DomainError,
  ValidationError,
  AuthenticationError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  // Decorators
  injectable,
  inject,
  singleton,
  // Repository
  DrizzleRepository,
  // Event
  createEvent,
  // Container (for advanced use)
  ServiceContainerImpl,
} from "@servicexjs/core";

export type {
  // Repository
  Repository,
  // RPC
  AuthContext,
  RpcContext,
  RpcMethodHandler,
  RpcMethods,
  RpcRequest,
  RpcResponse,
  RpcSuccessResponse,
  RpcErrorResponse,
  // Event
  PlatformEvent,
  UserCreatedEvent,
  UserCreatedPayload,
  // Container
  ServiceDefinition,
  RegistrationContext,
  RegisterFn,
  Runtime,
} from "@servicexjs/core";

/**
 * Fluent builder for defining and running a service.
 */
interface ServiceBuilder {
  /** Declare RPC method handlers. */
  rpc(methods: RpcMethods): ServiceBuilder;
  /** Declare dependency registration. */
  register(fn: RegisterFn): ServiceBuilder;
  /** Declare methods that don't require authentication. */
  publicMethods(methods: string[]): ServiceBuilder;
  /** Bind to a platform runtime and produce the runnable export. */
  run<T>(runtime: Runtime<T>): T;
}

class ServiceBuilderImpl implements ServiceBuilder {
  private _definition: ServiceDefinition;

  constructor(name: string) {
    this._definition = {
      name,
      methods: {},
      registerFn: null,
      publicMethods: [],
    };
  }

  rpc(methods: RpcMethods): ServiceBuilder {
    this._definition.methods = { ...this._definition.methods, ...methods };
    return this;
  }

  register(fn: RegisterFn): ServiceBuilder {
    this._definition.registerFn = fn;
    return this;
  }

  publicMethods(methods: string[]): ServiceBuilder {
    this._definition.publicMethods = [
      ...this._definition.publicMethods,
      ...methods,
    ];
    return this;
  }

  run<T>(runtime: Runtime<T>): T {
    return runtime.create(this._definition);
  }
}

/**
 * Create a service with a fluent API.
 *
 * Everything before `.run()` is platform-agnostic — pure service definition.
 * `.run()` binds to a platform runtime and produces the runnable export.
 *
 * @example
 * ```ts
 * import { createService, Entity, Id, injectable, inject } from "servicexjs";
 * import { node } from "@servicexjs/node";
 *
 * export default createService("tenant")
 *   .register((ctx, env) => {
 *     ctx.value("DB", env.DB);
 *     ctx.bind("TenantRepo", TenantRepo);
 *     ctx.bind("TenantService", TenantService);
 *   })
 *   .rpc({
 *     "tenant.create": async (params, ctx) => {
 *       const svc = ctx.resolve<TenantService>("TenantService");
 *       return svc.create(params.name, ctx.auth.tenantId);
 *     },
 *   })
 *   .run(node({ port: 3000 }));
 * ```
 */
export function createService(name: string): ServiceBuilder {
  return new ServiceBuilderImpl(name);
}
