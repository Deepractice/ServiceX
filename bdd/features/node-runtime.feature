Feature: Node Runtime — RPC Endpoint and Error Mapping

  The Node.js runtime adapter for development and testing.
  Exposes /api/rpc via Hono, handles auth and error mapping.

  Background:
    Given a running hello service

  Scenario: Successful RPC call
    When sending RPC request "hello.greet" with params {"name": "world"}
    Then the response status should be 200
    And the response should contain a result

  Scenario: Unknown method returns 404
    When sending RPC request "hello.unknown" with params {}
    Then the response status should be 404
    And the error code should be "METHOD_NOT_FOUND"

  Scenario: Invalid JSON returns 400
    When sending an invalid JSON body
    Then the response status should be 400
    And the error code should be "INVALID_REQUEST"

  Scenario: Missing method field returns 400
    When sending a request without a method field
    Then the response status should be 400
    And the error code should be "INVALID_REQUEST"

  Scenario: Unauthenticated request returns 401
    When sending RPC request "hello.greet" without a token
    Then the response status should be 401
    And the error code should be "UNAUTHORIZED"

  Scenario Outline: Domain errors map to HTTP status codes
    When calling a method that throws <errorType>
    Then the response status should be <statusCode>
    And the error code should be "<errorCode>"

    Examples:
      | errorType       | statusCode | errorCode        |
      | ValidationError | 400        | VALIDATION_ERROR |
      | NotFoundError   | 404        | NOT_FOUND        |
      | ForbiddenError  | 403        | FORBIDDEN        |
      | ConflictError   | 409        | CONFLICT         |
