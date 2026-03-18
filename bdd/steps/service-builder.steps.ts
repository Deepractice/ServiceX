import { strict as assert } from "node:assert";
import { Then, When } from "@deepracticex/bdd";
import { SignJWT } from "jose";
import { node } from "../../packages/node/src/index";
import { createService } from "../../packages/servicexjs/src/index";
import type { ServiceXWorld } from "../support/world";

async function createTestToken(): Promise<string> {
  const key = new TextEncoder().encode("dev-secret");
  return new SignJWT({
    sub: "user-1",
    tenantId: "tenant-1",
    email: "test@test.com",
    name: "Test",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("1h")
    .sign(key);
}

When(
  "creating service {string} with RPC method {string}",
  function (this: ServiceXWorld, name: string, method: string) {
    (this as any)._serviceName = name;
    (this as any)._methods = {
      [method]: async (params: any) => ({ greeting: `Hello, ${params.name || "world"}!` }),
    };
  }
);

When("running with the node runtime", function (this: ServiceXWorld) {
  const methods = (this as any)._methods || {};
  this.runResult = createService((this as any)._serviceName || "test")
    .rpc(methods)
    .run(node({ port: 0 }));
});

Then("it should return a result with app and port", function (this: ServiceXWorld) {
  assert.ok(this.runResult);
  assert.ok(this.runResult.app);
  assert.equal(typeof this.runResult.port, "number");
});

When(
  "creating service {string} with chained methods {string} and {string}",
  function (this: ServiceXWorld, name: string, method1: string, method2: string) {
    (this as any)._serviceName = name;
    (this as any)._methods = {
      [method1]: async (params: any) => ({ result: (params.a || 0) + (params.b || 0) }),
      [method2]: async (params: any) => ({ result: (params.a || 0) - (params.b || 0) }),
    };
    (this as any)._method1 = method1;
    (this as any)._method2 = method2;
  }
);

Then("both methods should be callable", async function (this: ServiceXWorld) {
  const app = this.runResult.app;
  const token = await createTestToken();
  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  const res1 = await app.request("/api/rpc", {
    method: "POST",
    headers,
    body: JSON.stringify({ method: (this as any)._method1, params: { a: 3, b: 1 } }),
  });
  const body1 = await res1.json();
  assert.equal(body1.result.result, 4);

  const res2 = await app.request("/api/rpc", {
    method: "POST",
    headers,
    body: JSON.stringify({ method: (this as any)._method2, params: { a: 3, b: 1 } }),
  });
  const body2 = await res2.json();
  assert.equal(body2.result.result, 2);
});

When(
  "creating service {string} with {string} as a public method",
  function (this: ServiceXWorld, name: string, method: string) {
    (this as any)._serviceName = name;
    (this as any)._methods = {
      [method]: { handler: async () => ({ status: "ok" }), permissions: [] },
    };
  }
);

Then(
  "calling {string} should not require an auth token",
  async function (this: ServiceXWorld, method: string) {
    const res = await this.runResult.app.request("/api/rpc", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ method, params: {} }),
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(body.result);
  }
);
