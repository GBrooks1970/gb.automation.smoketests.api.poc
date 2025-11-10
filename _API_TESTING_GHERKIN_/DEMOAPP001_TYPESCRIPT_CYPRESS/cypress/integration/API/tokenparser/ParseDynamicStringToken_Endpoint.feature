Feature: Dynamic String Parser Endpoint
    As a user
    I want to parse tokens and generate strings based on different token formats
    So that the correct type of string is returned based on the input token in the API response.

    Scenario Outline: Parse dynamic string tokens
        Given the ParseDynamicStringToken endpoint is running
        When A request with dynamic string token "<token>" to the ParseDynamicStringToken endpoint
        Then the API response should return a status code of <statusCode> for the ParseDynamicStringToken endpoint
        And the response should contain "<key>" with the value "<expectedValue>"

        Examples:
            | token                                  | statusCode | key         | expectedValue                                                                        |
            | INVALIDTOKEN                           | 400        | Error       | Invalid string token format                                                          |
            | [ALPHA-NUMERIC-5]                      | 200        | ParsedToken | An alpha-numeric string of length 5                                                  |
            | [PUNCTUATION-3]                        | 200        | ParsedToken | A string of punctuation characters of length 3                                       |
            | [ALPHA-NUMERIC-PUNCTUATION-10-LINES-2] | 200        | ParsedToken | 2 lines of strings with each line containing 10 alpha-numeric-punctuation characters |

