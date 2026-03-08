import { strict as assert } from "node:assert";
import { Given, Then, When } from "@deepracticex/bdd";
import { injectable, ServiceContainerImpl } from "../../packages/core/src/index";
import type { ServiceXWorld } from "../support/world";

@injectable()
class GreetingService {
  greet(name: string): string {
    return `Hello, ${name}!`;
  }
}

Given("a new ServiceContainer", function (this: ServiceXWorld) {
  this.container = new ServiceContainerImpl();
});

When(
  "registering value {string} as {string}",
  function (this: ServiceXWorld, token: string, value: string) {
    this.container.initialize((ctx: any) => ctx.value(token, value), {});
  }
);

Then(
  "resolving {string} should return {string}",
  function (this: ServiceXWorld, token: string, expected: string) {
    assert.equal(this.container.resolve(token), expected);
  }
);

When(
  "binding {string} to the GreetingService class",
  function (this: ServiceXWorld, token: string) {
    this.container.initialize((ctx: any) => ctx.bind(token, GreetingService), {});
  }
);

Then(
  "resolving {string} should return a GreetingService instance",
  function (this: ServiceXWorld, token: string) {
    assert.ok(this.container.resolve(token) instanceof GreetingService);
  }
);

Then(
  "resolving {string} twice should return the same instance",
  function (this: ServiceXWorld, token: string) {
    const a = this.container.resolve(token);
    const b = this.container.resolve(token);
    assert.strictEqual(a, b);
  }
);

When("initializing the container twice", function (this: ServiceXWorld) {
  let callCount = 0;
  const registerFn = (ctx: any) => {
    callCount++;
    ctx.value("counter", callCount);
  };
  this.container.initialize(registerFn, {});
  this.container.initialize(registerFn, {});
  (this as any)._callCount = callCount;
});

Then("the second initialization should be ignored", function (this: ServiceXWorld) {
  assert.equal((this as any)._callCount, 1);
  assert.ok(this.container.initialized);
});
