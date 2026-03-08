Feature: Domain Primitives — Entity, ValueObject, Id

  ServiceX provides DDD domain primitives for business modeling.

  Scenario: Generate unique ID with prefix
    When generating an ID with prefix "tnt"
    Then the ID should start with "tnt_"
    And generating two IDs should produce different values

  Scenario: Validate ID prefix
    Given an ID "tnt_abc123_xyz"
    Then validating prefix "tnt" should pass
    And validating prefix "usr" should fail

  Scenario: Entity compared by identity
    Given two Entities with the same ID "entity-1"
    Then they should be equal
    Given two Entities with different IDs "entity-1" and "entity-2"
    Then they should not be equal

  Scenario: ValueObject compared by value
    Given two ValueObjects with the same value "hello"
    Then they should be equal
    Given two ValueObjects with different values "hello" and "world"
    Then they should not be equal
