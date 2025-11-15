Feature: Parse Dynamic String Token Endpoint
  Scenario Outline: Parse dynamic string token
    Given a dynamic string token "<token>"
    When I send a GET request to "/parse-dynamic-string-token" with the token query
    Then the response status should be <status>
    And the dynamic string response should satisfy "<expectation>"

    Examples:
      | token                                       | status | expectation                          |
      | INVALIDTOKEN                                | 400    | error                                |
      | [ALPHA-NUMERIC-5]                           | 200    | regex:^[A-Za-z0-9]{5}$               |
      | [PUNCTUATION-3]                             | 200    | regex:^[\.,!?;:]{3}$                 |
      | [ALPHA-NUMERIC-PUNCTUATION-10-LINES-2]      | 200    | lines:2,length:10,charset:alnumpunct |
