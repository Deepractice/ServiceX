// Container (internal, for runtime adapters)

export type { RegisterFn, RegistrationContext, Runtime, ServiceDefinition } from "./container";
export { ServiceContainerImpl } from "./container";
// Decorators
export { inject, injectable, singleton } from "./decorators";
// Domain
export {
  AuthenticationError,
  ConflictError,
  DomainError,
  Entity,
  ForbiddenError,
  Id,
  NotFoundError,
  ValidationError,
  ValueObject,
} from "./domain";
export type { PlatformEvent, UserCreatedEvent, UserCreatedPayload } from "./event";
// Event
export { createEvent } from "./event";
export type { Repository } from "./repository";
// Repository
export { DrizzleRepository } from "./repository";
// RPC types
export type {
  AuthContext,
  MethodSchema,
  RpcContext,
  RpcError,
  RpcErrorResponse,
  RpcMethodHandler,
  RpcMethods,
  RpcRequest,
  RpcResponse,
  RpcSuccessResponse,
  ServiceSchema,
} from "./rpc";
// RPC constants
export {
  DOMAIN_ERROR_CODE_MAP,
  ERROR_HTTP_STATUS_MAP,
  ErrorCodes,
  JSONRPC_VERSION,
} from "./rpc";
