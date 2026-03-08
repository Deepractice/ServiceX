Feature: Domain Error Hierarchy

  ServiceX provides a standardized domain error hierarchy.
  Runtime adapters map these to corresponding HTTP status codes.

  Scenario Outline: Domain errors carry correct error codes
    When throwing a <errorType> with message "<message>"
    Then the domain error code should be "<errorCode>"
    And the error message should be "<message>"
    And the error should be an instance of DomainError

    Examples:
      | errorType           | message              | errorCode            |
      | ValidationError     | Name cannot be empty | VALIDATION_ERROR     |
      | AuthenticationError | Not authenticated    | AUTHENTICATION_ERROR |
      | ForbiddenError      | No permission        | FORBIDDEN            |
      | NotFoundError       | Resource not found   | NOT_FOUND            |
      | ConflictError       | Already exists       | CONFLICT             |

  Scenario: Error types have default messages
    When throwing an AuthenticationError without a message
    Then the error message should be "Authentication required"
    When throwing a NotFoundError without a message
    Then the error message should be "Not found"
