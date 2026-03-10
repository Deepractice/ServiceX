import type { RegisterFn, RpcMethods, Runtime, ServiceDefinition } from "@servicexjs/core";

export type {
  // RPC
  AuthContext,
  MethodSchema,
  // Event
  PlatformEvent,
  RegisterFn,
  RegistrationContext,
  // Repository
  Repository,
  RpcContext,
  RpcError,
  RpcErrorResponse,
  RpcMethodHandler,
  RpcMethods,
  RpcRequest,
  RpcResponse,
  RpcSuccessResponse,
  Runtime,
  // Container
  ServiceDefinition,
  ServiceSchema,
  UserCreatedEvent,
  UserCreatedPayload,
} from "@servicexjs/core";
// Re-export everything from core — users only need "servicexjs"
export {
  AuthenticationError,
  ConflictError,
  // Event
  createEvent,
  DOMAIN_ERROR_CODE_MAP,
  DomainError,
  // Repository
  DrizzleRepository,
  // Domain
  Entity,
  ERROR_HTTP_STATUS_MAP,
  ErrorCodes,
  ForbiddenError,
  Id,
  inject,
  // Decorators
  injectable,
  JSONRPC_VERSION,
  NotFoundError,
  // Container (for advanced use)
  ServiceContainerImpl,
  singleton,
  ValidationError,
  ValueObject,
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
    this._definition.publicMethods = [...this._definition.publicMethods, ...methods];
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
 * import { createService, Entity, Id } from "servicexjs";
 * import { cloudflare } from "@deepractice/servicex-cloudflare";
 *
 * export default createService("auth")
 *   .rpc({
 *     "key.create": async (params, ctx) => { ... },
 *     "key.verify": async (params, ctx) => { ... },
 *   })
 *   .publicMethods(["key.verify"])
 *   .run(cloudflare());
 * ```
 */
export function createService(name: string): ServiceBuilder {
  return new ServiceBuilderImpl(name);
}
