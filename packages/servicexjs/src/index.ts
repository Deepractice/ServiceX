import type {
  NormalizedRpcMethods,
  RegisterFn,
  RpcMethodHandler,
  RpcMethods,
  Runtime,
  ServiceDefinition,
} from "@servicexjs/core";
import { normalizeMethod } from "@servicexjs/core";

/**
 * RPC Protocol definition — can be from @deepracticex/rpc or any compatible shape.
 */
interface RpcProtocolLike {
  namespace: string;
  version: string;
  methods: { name: string; description?: string; permissions?: string[] }[];
}

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
   * Two calling conventions:
   *
   * **Inline** — methods with handlers defined together:
   * ```ts
   * .rpc({
   *   "session.create": async (params, ctx) => { ... },
   *   "key.create": {
   *     handler: async (params, ctx) => { ... },
   *     description: "Create an API key",
   *     permissions: ["admin"],
   *   },
   * })
   * ```
   *
   * **Protocol + handlers** — separate protocol (source of truth) from handlers:
   * ```ts
   * .rpc(protocol, {
   *   "session.create": async (p, ctx) => { ... },
   *   "key.create": async (p, ctx) => { ... },
   * })
   * ```
   * Protocol provides name, description, permissions. Handlers provide implementation.
   */
  rpc(methods: RpcMethods): ServiceBuilder;
  rpc(protocol: RpcProtocolLike, handlers: Record<string, RpcMethodHandler>): ServiceBuilder;
  /** Declare public methods (no auth required). Can be called multiple times. */
  publicMethods(names: string[]): ServiceBuilder;
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

  rpc(
    methodsOrProtocol: RpcMethods | RpcProtocolLike,
    handlers?: Record<string, RpcMethodHandler>,
  ): ServiceBuilder {
    if (handlers && "methods" in methodsOrProtocol && "namespace" in methodsOrProtocol) {
      // Protocol + handlers mode
      const protocol = methodsOrProtocol as RpcProtocolLike;
      for (const method of protocol.methods) {
        const handler = handlers[method.name];
        if (!handler) {
          throw new Error(
            `[${this._definition.name}] Missing handler for protocol method "${method.name}"`,
          );
        }
        this._definition.methods[method.name] = {
          handler,
          description: method.description,
          permissions: method.permissions,
        };
      }
    } else {
      // Inline methods mode (existing behavior)
      const methods = methodsOrProtocol as RpcMethods;
      for (const [name, entry] of Object.entries(methods)) {
        this._definition.methods[name] = normalizeMethod(entry);
      }
    }
    return this;
  }

  publicMethods(names: string[]): ServiceBuilder {
    for (const name of names) {
      const method = this._definition.methods[name];
      if (method) {
        method.permissions = [];
      }
    }
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
