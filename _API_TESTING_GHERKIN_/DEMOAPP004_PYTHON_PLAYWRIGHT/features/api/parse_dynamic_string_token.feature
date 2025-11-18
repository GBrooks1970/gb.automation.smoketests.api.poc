@api
Feature: Parse Dynamic String Token Endpoint
  Scenario Outline: Parse dynamic string token
    Given a dynamic string token "<token>"
    When I send a GET request to "/parse-dynamic-string-token" with the token query
    Then the response status should be <status>
    And the response should contain "<key>" with the value "<expectation>"

    Examples:
      | token                                  | status | key         | expectation                                                                        |
      | INVALIDTOKEN                           | 400    | Error       | Invalid string token format                                                        |
      | [ALPHA-NUMERIC-5]                      | 200    | ParsedToken | An alpha-numeric string of length 5                                                |
      | [PUNCTUATION-3]                        | 200    | ParsedToken | A string of punctuation characters of length 3                                     |
      | [ALPHA-NUMERIC-PUNCTUATION-10-LINES-2] | 200    | ParsedToken | 2 lines of strings with each line containing 10 alpha-numeric-punctuation characters |
      | [NUMERIC-8]                            | 200    | ParsedToken | A numeric string of length 8                                                       |
      | [SPECIAL-5-LINES-3]                    | 200    | ParsedToken | 3 lines of strings with each line containing 5 special characters                  |
      | [ALPHA-NUMERIC-SPECIAL-12]             | 200    | ParsedToken | A mixed alpha, numeric, and special character string of length 12                  |
