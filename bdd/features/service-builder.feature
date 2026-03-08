Feature: Fluent Service Builder — createService API

  createService() is the single user entry point.
  Everything before .run() is platform-agnostic, .run() binds to a runtime.

  Scenario: Create a minimal service and run it
    When creating service "hello" with RPC method "hello.greet"
    And running with the node runtime
    Then it should return a result with app and port

  Scenario: Chain multiple RPC methods
    When creating service "calc" with chained methods "calc.add" and "calc.sub"
    And running with the node runtime
    Then both methods should be callable

  Scenario: Declare public methods to skip authentication
    When creating service "public" with "health.check" as a public method
    And running with the node runtime
    Then calling "health.check" should not require an auth token
