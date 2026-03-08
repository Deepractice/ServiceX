/**
 * Domain error hierarchy.
 * Platform adapters map these to appropriate HTTP status codes.
 */
export class DomainError extends Error {
  constructor(
    message: string,
    public readonly code: string
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class ValidationError extends DomainError {
  constructor(message: string) {
    super(message, "VALIDATION_ERROR");
  }
}

export class AuthenticationError extends DomainError {
  constructor(message: string = "Authentication required") {
    super(message, "AUTHENTICATION_ERROR");
  }
}

export class ForbiddenError extends DomainError {
  constructor(message: string = "Forbidden") {
    super(message, "FORBIDDEN");
  }
}

export class NotFoundError extends DomainError {
  constructor(message: string = "Not found") {
    super(message, "NOT_FOUND");
  }
}

export class ConflictError extends DomainError {
  constructor(message: string = "Conflict") {
    super(message, "CONFLICT");
  }
}
