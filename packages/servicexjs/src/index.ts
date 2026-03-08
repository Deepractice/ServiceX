import type {
  ServiceDefinition,
  RegisterFn,
  Runtime,
  RpcMethods,
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
 * import { createService } from "servicexjs";
 * import { cloudflare } from "@servicexjs/platform";
 * import { injectable, inject } from "@servicexjs/core";
 *
 * export default createService("tenant")
 *   .register((ctx, env) => {
 *     ctx.value("DB", drizzle(env.DB));
 *     ctx.bind("TenantRepo", DrizzleTenantRepo);
 *     ctx.bind("TenantService", TenantService);
 *   })
 *   .rpc({
 *     "tenant.create": async (params, ctx) => {
 *       const svc = ctx.resolve<TenantService>("TenantService");
 *       return svc.create(params.name, ctx.auth.tenantId);
 *     },
 *     "tenant.list": async (_params, ctx) => {
 *       const svc = ctx.resolve<TenantService>("TenantService");
 *       return svc.list(ctx.auth.tenantId);
 *     },
 *   })
 *   .publicMethods(["health.check"])
 *   .run(cloudflare({
 *     auth: { secretKey: "JWT_SECRET" },
 *   }));
 * ```
 */
export function createService(name: string): ServiceBuilder {
  return new ServiceBuilderImpl(name);
}
