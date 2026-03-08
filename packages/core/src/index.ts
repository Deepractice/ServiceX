// Container (internal, for runtime adapters)
export { ServiceContainerImpl } from "./container";
export type { ServiceDefinition, RegistrationContext, RegisterFn, Runtime } from "./container";

// Domain
export {
  Entity,
  ValueObject,
  Id,
  DomainError,
  ValidationError,
  AuthenticationError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
} from "./domain";

// Decorators
export { injectable, inject, singleton } from "./decorators";

// Repository
export { DrizzleRepository } from "./repository";
export type { Repository } from "./repository";

// RPC types
export type {
  AuthContext,
  RpcContext,
  RpcMethodHandler,
  RpcMethods,
  RpcRequest,
  RpcResponse,
  RpcSuccessResponse,
  RpcErrorResponse,
} from "./rpc";

// Event
export { createEvent } from "./event";
export type { PlatformEvent, UserCreatedEvent, UserCreatedPayload } from "./event";
