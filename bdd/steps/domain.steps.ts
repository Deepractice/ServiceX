import { strict as assert } from "node:assert";
import { Given, Then, When } from "@deepracticex/bdd";
import { Entity, Id, ValueObject } from "../../packages/core/src/index";
import type { ServiceXWorld } from "../support/world";

class TestEntity extends Entity<string> {
  constructor(id: string) {
    super(id);
  }
}

class TestValueObject extends ValueObject<string> {
  constructor(private _val: string) {
    super();
  }
  protected get value(): string {
    return this._val;
  }
}

// --- Id ---

When("generating an ID with prefix {string}", function (this: ServiceXWorld, prefix: string) {
  this.generatedId = Id.generate(prefix);
});

Then("the ID should start with {string}", function (this: ServiceXWorld, prefix: string) {
  assert.ok(this.generatedId!.startsWith(prefix));
});

Then("generating two IDs should produce different values", function (this: ServiceXWorld) {
  this.generatedId2 = Id.generate("tnt");
  assert.notEqual(this.generatedId, this.generatedId2);
});

Given("an ID {string}", function (this: ServiceXWorld, id: string) {
  this.generatedId = id;
});

Then("validating prefix {string} should pass", function (this: ServiceXWorld, prefix: string) {
  assert.ok(Id.isValid(this.generatedId!, prefix));
});

Then("validating prefix {string} should fail", function (this: ServiceXWorld, prefix: string) {
  assert.ok(!Id.isValid(this.generatedId!, prefix));
});

// --- Entity ---

Given("two Entities with the same ID {string}", function (this: ServiceXWorld, id: string) {
  this.entity1 = new TestEntity(id);
  this.entity2 = new TestEntity(id);
});

Given(
  "two Entities with different IDs {string} and {string}",
  function (this: ServiceXWorld, id1: string, id2: string) {
    this.entity1 = new TestEntity(id1);
    this.entity2 = new TestEntity(id2);
  }
);

Then("they should be equal", function (this: ServiceXWorld) {
  const a = this.entity1 ?? this.valueObject1;
  const b = this.entity2 ?? this.valueObject2;
  assert.ok(a.equals(b));
});

Then("they should not be equal", function (this: ServiceXWorld) {
  const a = this.entity1 ?? this.valueObject1;
  const b = this.entity2 ?? this.valueObject2;
  assert.ok(!a.equals(b));
});

// --- ValueObject ---

Given("two ValueObjects with the same value {string}", function (this: ServiceXWorld, val: string) {
  this.entity1 = undefined;
  this.entity2 = undefined;
  this.valueObject1 = new TestValueObject(val);
  this.valueObject2 = new TestValueObject(val);
});

Given(
  "two ValueObjects with different values {string} and {string}",
  function (this: ServiceXWorld, val1: string, val2: string) {
    this.entity1 = undefined;
    this.entity2 = undefined;
    this.valueObject1 = new TestValueObject(val1);
    this.valueObject2 = new TestValueObject(val2);
  }
);
