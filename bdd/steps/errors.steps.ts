import { strict as assert } from "node:assert";
import { Then, When } from "@deepracticex/bdd";
import {
  AuthenticationError,
  ConflictError,
  DomainError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "../../packages/core/src/index";
import type { ServiceXWorld } from "../support/world";

const ERROR_MAP: Record<string, new (msg: string) => DomainError> = {
  ValidationError,
  AuthenticationError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
};

const NO_ARG_MAP: Record<string, new () => DomainError> = {
  AuthenticationError: AuthenticationError as any,
  NotFoundError: NotFoundError as any,
};

When(
  "throwing a {word} with message {string}",
  function (this: ServiceXWorld, errorType: string, message: string) {
    const ErrorClass = ERROR_MAP[errorType];
    assert.ok(ErrorClass, `Unknown error type: ${errorType}`);
    this.error = new ErrorClass(message);
  }
);

When("throwing an AuthenticationError without a message", function (this: ServiceXWorld) {
  this.error = new AuthenticationError();
});

When("throwing a NotFoundError without a message", function (this: ServiceXWorld) {
  this.error = new NotFoundError();
});

Then("the domain error code should be {string}", function (this: ServiceXWorld, code: string) {
  assert.ok(this.error instanceof DomainError);
  assert.equal(this.error.code, code);
});

Then("the error message should be {string}", function (this: ServiceXWorld, message: string) {
  assert.equal(this.error!.message, message);
});

Then("the error should be an instance of DomainError", function (this: ServiceXWorld) {
  assert.ok(this.error instanceof DomainError);
});
