Feature: Service Container — DI Registration and Resolution

  ServiceContainer hides the underlying DI implementation (tsyringe).
  Users register dependencies declaratively via register(ctx, env).

  Scenario: Register and resolve a value dependency
    Given a new ServiceContainer
    When registering value "DB" as "test-db-connection"
    Then resolving "DB" should return "test-db-connection"

  Scenario: Register and resolve a class binding (singleton)
    Given a new ServiceContainer
    When binding "GreetingService" to the GreetingService class
    Then resolving "GreetingService" should return a GreetingService instance
    And resolving "GreetingService" twice should return the same instance

  Scenario: Container initializes only once
    Given a new ServiceContainer
    When initializing the container twice
    Then the second initialization should be ignored
