Feature: Parse Date Token Endpoint
  As a consumer
  I want to resolve date tokens via the API
  So that I receive deterministic UTC timestamps

  Scenario Outline: Parse a date token
    Given a date token "<token>"
    When I send a GET request to "/parse-date-token" with the token query
    Then the response status should be <status>
    And the response field "<key>" should match "<expectation>"

    Examples:
      | token                | status | key         | expectation                       |
      | INVALIDTOKEN         | 400    | Error       | Invalid string token format       |
      | [TODAY]              | 200    | ParsedToken | resolves to today                 |
      | [TODAY-1YEAR-1MONTH] | 200    | ParsedToken | resolves via local date parser    |
