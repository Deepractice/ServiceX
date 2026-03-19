/**
 * JSON-RPC 2.0 type contracts.
 *
 * All RPC communication follows the JSON-RPC 2.0 specification.
 * @see https://www.jsonrpc.org/specification
 */

export const JSONRPC_VERSION = "2.0";

// ==================== JSON-RPC 2.0 Error Codes ====================

/**
 * Standard JSON-RPC 2.0 error codes + application-level codes.
 *
 * Standard range:
 *   -32700         Parse error
 *   -32600         Invalid request
 *   -32601         Method not found
 *   -32602         Invalid params
 *   -32603         Internal error
 *   -32000..-32099 Server error (reserved)
 *
 * Application range (ServiceX convention):
 *   -40100         Authentication error (401)
 *   -40300         Forbidden (403)
 *   -40400         Not found (404)
 *   -40900         Conflict (409)
 */
export const ErrorCodes = {
  // JSON-RPC 2.0 standard
  PARSE_ERROR: -32700,
  INVALID_REQUEST: -32600,
  METHOD_NOT_FOUND: -32601,
  INVALID_PARAMS: -32602,
  INTERNAL_ERROR: -32603,

  // Application-level (mapped from DomainError codes)
  VALIDATION_ERROR: -32602, // alias for INVALID_PARAMS
  AUTHENTICATION_ERROR: -40100,
  FORBIDDEN: -40300,
  NOT_FOUND: -40400,
  CONFLICT: -40900,
} as const;

/**
 * Map DomainError code strings to JSON-RPC 2.0 integer codes.
 */
export const DOMAIN_ERROR_CODE_MAP: Record<string, number> = {
  VALIDATION_ERROR: ErrorCodes.VALIDATION_ERROR,
  AUTHENTICATION_ERROR: ErrorCodes.AUTHENTICATION_ERROR,
  FORBIDDEN: ErrorCodes.FORBIDDEN,
  NOT_FOUND: ErrorCodes.NOT_FOUND,
  CONFLICT: ErrorCodes.CONFLICT,
};

/**
 * Map JSON-RPC error codes to HTTP status codes.
 */
export const ERROR_HTTP_STATUS_MAP: Record<number, number> = {
  [ErrorCodes.PARSE_ERROR]: 400,
  [ErrorCodes.INVALID_REQUEST]: 400,
  [ErrorCodes.METHOD_NOT_FOUND]: 404,
  [ErrorCodes.INVALID_PARAMS]: 400,
  [ErrorCodes.INTERNAL_ERROR]: 500,
  [ErrorCodes.AUTHENTICATION_ERROR]: 401,
  [ErrorCodes.FORBIDDEN]: 403,
  [ErrorCodes.NOT_FOUND]: 404,
  [ErrorCodes.CONFLICT]: 409,
};

// ==================== Auth ====================

/**
 * Auth context injected into RPC handlers by the runtime.
 */
export interface AuthContext {
  userId: string;
  tenantId: string;
  email: string;
  name: string;
  permissions: string[];
  avatarUrl?: string;
}

// ==================== RPC Context ====================

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

// ==================== Method Handler ====================

/**
 * A single RPC method handler.
 */
export type RpcMethodHandler<TParams = any, TResult = any> = (
  params: TParams,
  ctx: RpcContext
) => Promise<TResult> | TResult;

/**
 * RPC method definition with metadata.
 *
 * - `permissions: undefined` → requires authentication (default)
 * - `permissions: []` → public, no auth needed
 * - `permissions: ["admin"]` → requires auth + specific permission
 */
export interface RpcMethodDefinition {
  handler: RpcMethodHandler;
  description?: string;
  permissions?: string[];
}

/**
 * A method entry: either a bare handler or a full definition with metadata.
 */
export type RpcMethodEntry = RpcMethodHandler | RpcMethodDefinition;

/**
 * Map of method names to their handlers or definitions.
 */
export type RpcMethods = Record<string, RpcMethodEntry>;

/**
 * Normalized method map — all entries resolved to full definitions.
 * Used internally by ServiceDefinition and runtime adapters.
 */
export type NormalizedRpcMethods = Record<string, RpcMethodDefinition>;

/**
 * Check if a method entry is a full definition (not a bare handler).
 */
export function isMethodDefinition(entry: RpcMethodEntry): entry is RpcMethodDefinition {
  return typeof entry === "object" && entry !== null && "handler" in entry;
}

/**
 * Normalize a method entry to a full definition.
 */
export function normalizeMethod(entry: RpcMethodEntry): RpcMethodDefinition {
  if (isMethodDefinition(entry)) {
    return entry;
  }
  return { handler: entry };
}

// ==================== JSON-RPC 2.0 Request/Response ====================

/**
 * JSON-RPC 2.0 request.
 */
export interface RpcRequest {
  jsonrpc: "2.0";
  id?: string | number | null;
  method: string;
  params?: Record<string, unknown>;
}

/**
 * JSON-RPC 2.0 success response.
 */
export interface RpcSuccessResponse<T = unknown> {
  jsonrpc: "2.0";
  id: string | number | null;
  result: T;
}

/**
 * JSON-RPC 2.0 error object.
 */
export interface RpcError {
  code: number;
  message: string;
  data?: unknown;
}

/**
 * JSON-RPC 2.0 error response.
 */
export interface RpcErrorResponse {
  jsonrpc: "2.0";
  id: string | number | null;
  error: RpcError;
}

export type RpcResponse<T = unknown> = RpcSuccessResponse<T> | RpcErrorResponse;

// ==================== Schema ====================

/**
 * Method schema for /rpc/methods.
 */
export interface MethodSchema {
  name: string;
  description?: string;
  permissions?: string[];
}

/**
 * Service schema returned by /rpc/methods.
 */
export interface ServiceSchema {
  name: string;
  methods: MethodSchema[];
}
