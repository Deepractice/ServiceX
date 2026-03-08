/**
 * RPC type contracts.
 * Defines the shape of RPC requests, responses, and method handlers.
 * The actual HTTP dispatch lives in @servicexjs/platform.
 */

/**
 * Auth context injected into RPC handlers by the runtime.
 */
export interface AuthContext {
  userId: string;
  tenantId: string;
  email: string;
  name: string;
  avatarUrl?: string;
}

/**
 * Context available to each RPC method handler.
 */
export interface RpcContext {
  /** Authenticated user info (null if public method). */
  auth: AuthContext;
  /** Resolve a dependency from the service container. */
  resolve<T>(token: string): T;
  /** Raw environment variables (platform-injected). */
  env: Record<string, unknown>;
}

/**
 * A single RPC method handler.
 */
export type RpcMethodHandler<TParams = any, TResult = any> = (
  params: TParams,
  ctx: RpcContext,
) => Promise<TResult> | TResult;

/**
 * Map of method names to their handlers.
 */
export type RpcMethods = Record<string, RpcMethodHandler>;

/**
 * RPC request format — the universal internal API contract.
 */
export interface RpcRequest {
  method: string;
  params?: Record<string, unknown>;
}

/**
 * RPC response formats.
 */
export interface RpcSuccessResponse<T = unknown> {
  result: T;
}

export interface RpcErrorResponse {
  error: {
    code: string;
    message: string;
  };
}

export type RpcResponse<T = unknown> = RpcSuccessResponse<T> | RpcErrorResponse;
