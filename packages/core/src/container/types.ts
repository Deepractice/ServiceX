import type { RpcMethods } from "../rpc";

/**
 * Registration context for declaring dependencies.
 */
export interface RegistrationContext {
  /** Bind a concrete value (e.g. database connection). */
  value<T>(token: string, val: T): void;
  /** Bind a class as singleton (shared instance). */
  bind<T>(token: string, cls: new (...args: any[]) => T): void;
  /** Bind a class as transient (new instance per resolution). */
  transient<T>(token: string, cls: new (...args: any[]) => T): void;
}

/**
 * Register function — called by runtime with platform environment.
 */
export type RegisterFn = (ctx: RegistrationContext, env: Record<string, unknown>) => void;

/**
 * The complete, platform-agnostic definition of a service.
 * Built via the fluent API in `servicexjs`, consumed by Runtime adapters.
 */
export interface ServiceDefinition {
  name: string;
  methods: RpcMethods;
  registerFn: RegisterFn | null;
  publicMethods: string[];
}

/**
 * Runtime adapter interface.
 * Platform packages implement this to run a ServiceDefinition.
 */
export interface Runtime<T> {
  create(definition: ServiceDefinition): T;
}
