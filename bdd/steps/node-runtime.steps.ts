import { strict as assert } from "node:assert";
import { Before, Given, Then, When } from "@deepracticex/bdd";
import { SignJWT } from "jose";
import {
  ConflictError,
  DomainError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "../../packages/core/src/index";
import { node } from "../../packages/node/src/index";
import { createService } from "../../packages/servicexjs/src/index";
import type { ServiceXWorld } from "../support/world";

let testApp: any;
let testToken: string;

Before(async () => {
  if (!testApp) {
    const result = createService("hello")
      .rpc({
        "hello.greet": async (params: any) => ({ greeting: `Hello, ${params.name}!` }),
        "error.validation": async () => {
          throw new ValidationError("invalid");
        },
        "error.notfound": async () => {
          throw new NotFoundError("not found");
        },
        "error.forbidden": async () => {
          throw new ForbiddenError("forbidden");
        },
        "error.conflict": async () => {
          throw new ConflictError("conflict");
        },
      })
      .run(node({ port: 0 }));
    testApp = result.app;
  }

  if (!testToken) {
    const key = new TextEncoder().encode("dev-secret");
    testToken = await new SignJWT({
      sub: "user-1",
      tenantId: "tenant-1",
      email: "test@test.com",
      name: "Test User",
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("1h")
      .sign(key);
  }
});

Given("a running hello service", () => {
  assert.ok(testApp, "Test app should be initialized");
});

When(
  "sending RPC request {string} with params {}",
  async function (this: ServiceXWorld, method: string, paramsJson: string) {
    const params = JSON.parse(paramsJson);
    this.response = await testApp.request("/api/rpc", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${testToken}`,
      },
      body: JSON.stringify({ method, params }),
    });
    this.responseBody = await this.response!.json();
  }
);

When("sending an invalid JSON body", async function (this: ServiceXWorld) {
  this.response = await testApp.request("/api/rpc", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${testToken}`,
    },
    body: "not valid json{{{",
  });
  this.responseBody = await this.response!.json();
});

When("sending a request without a method field", async function (this: ServiceXWorld) {
  this.response = await testApp.request("/api/rpc", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${testToken}`,
    },
    body: JSON.stringify({ params: {} }),
  });
  this.responseBody = await this.response!.json();
});

When(
  "sending RPC request {string} without a token",
  async function (this: ServiceXWorld, method: string) {
    this.response = await testApp.request("/api/rpc", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ method, params: {} }),
    });
    this.responseBody = await this.response!.json();
  }
);

const ERROR_TYPE_TO_METHOD: Record<string, string> = {
  ValidationError: "error.validation",
  NotFoundError: "error.notfound",
  ForbiddenError: "error.forbidden",
  ConflictError: "error.conflict",
};

When(
  "calling a method that throws {word}",
  async function (this: ServiceXWorld, errorType: string) {
    const method = ERROR_TYPE_TO_METHOD[errorType];
    assert.ok(method, `Unknown error type: ${errorType}`);
    this.response = await testApp.request("/api/rpc", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${testToken}`,
      },
      body: JSON.stringify({ method, params: {} }),
    });
    this.responseBody = await this.response!.json();
  }
);

Then("the response status should be {int}", function (this: ServiceXWorld, status: number) {
  assert.equal(this.response!.status, status);
});

Then("the response should contain a result", function (this: ServiceXWorld) {
  assert.ok(this.responseBody.result !== undefined);
});

Then("the error code should be {string}", function (this: ServiceXWorld, code: string) {
  assert.equal(this.responseBody.error.code, code);
});
