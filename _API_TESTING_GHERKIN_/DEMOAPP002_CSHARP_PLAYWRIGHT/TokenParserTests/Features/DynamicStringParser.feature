Feature: Dynamic String Parser Endpoint 01
  As a user
  I want to parse tokens and generate strings based on different token formats
  So that the correct type of string is returned based on the input token in the API response.

  Scenario Outline: Parse dynamic string tokens
    Given the TokenParser API is available
    When a request with dynamic string token '<token>' is made to the DynamicStringParser endpoint
    Then the API response should return a status code of <statusCode> for the DynamicStringParser endpoint
    And the response should contain "<key>" with the value "<expectedValue>"

    Examples:
      | token                                  | statusCode | key         | expectedValue                                                                        |
      | INVALIDTOKEN                           | 400        | error       | Invalid string token format                                                          |
      | [ALPHA-NUMERIC-5]                      | 200        | parsedToken | An alpha-numeric string of length 5                                                  |
      | [PUNCTUATION-3]                        | 200        | parsedToken | A string of punctuation characters of length 3                                       |
      | [ALPHA-NUMERIC-PUNCTUATION-10-LINES-2] | 200        | parsedToken | 2 lines of strings with each line containing 10 alpha-numeric-punctuation characters |
