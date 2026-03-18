import type {
  NormalizedRpcMethods,
  RegisterFn,
  RpcMethods,
  Runtime,
  ServiceDefinition,
} from "@servicexjs/core";
import { normalizeMethod } from "@servicexjs/core";

export type {
  // RPC
  AuthContext,
  MethodSchema,
  NormalizedRpcMethods,
  // Event
  PlatformEvent,
  RegisterFn,
  RegistrationContext,
  // Repository
  Repository,
  RpcContext,
  RpcError,
  RpcErrorResponse,
  RpcMethodDefinition,
  RpcMethodEntry,
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
  isMethodDefinition,
  JSONRPC_VERSION,
  NotFoundError,
  normalizeMethod,
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
  /**
   * Declare RPC methods.
   *
   * Each method can be a bare handler or a full definition with metadata:
   * ```ts
   * .rpc({
   *   // Bare handler — requires auth (default)
   *   "tenant.get": async (params, ctx) => { ... },
   *
   *   // Full definition with metadata
   *   "tenant.create": {
   *     handler: async (params, ctx) => { ... },
   *     description: "Create a new tenant",
   *     permissions: ["admin"],
   *   },
   *
   *   // Public method (no auth required)
   *   "health.check": {
   *     handler: async () => ({ ok: true }),
   *     description: "Health check",
   *     permissions: [],
   *   },
   * })
   * ```
   */
  rpc(methods: RpcMethods): ServiceBuilder;
  /** Declare dependency registration. */
  register(fn: RegisterFn): ServiceBuilder;
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
    };
  }

  rpc(methods: RpcMethods): ServiceBuilder {
    const normalized: NormalizedRpcMethods = {};
    for (const [name, entry] of Object.entries(methods)) {
      normalized[name] = normalizeMethod(entry);
    }
    this._definition.methods = { ...this._definition.methods, ...normalized };
    return this;
  }

  register(fn: RegisterFn): ServiceBuilder {
    this._definition.registerFn = fn;
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
 * import { createService } from "servicexjs";
 * import { cloudflare } from "@deepractice/servicex-cloudflare";
 *
 * export default createService("auth")
 *   .rpc({
 *     "key.create": {
 *       handler: async (params, ctx) => { ... },
 *       description: "Create an API key",
 *     },
 *     "key.verify": {
 *       handler: async (params, ctx) => { ... },
 *       description: "Verify an API key",
 *       permissions: [],  // public
 *     },
 *   })
 *   .run(cloudflare());
 * ```
 */
export function createService(name: string): ServiceBuilder {
  return new ServiceBuilderImpl(name);
}
