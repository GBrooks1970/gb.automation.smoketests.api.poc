Feature: Parse Date Token Endpoint
  As a user 
  I want to parse date tokens and receive the computed dates in the API response.
  So that the correct type of string is returned based on the input token in the API response.

Scenario Outline: Parse a date token
    Given a valid or invalid date token "<token>"
    When a GET request is made to the DateTokenParser Endpoint
    Then the API response for the DateTokenParser Endpoint should return a status code of <statusCode>
    And the response body should contain "<key>" with the value "<expectedValue>"

    Examples:
      | token                | statusCode | key         | expectedValue                                         |
      | INVALIDTOKEN         | 400        | Error       | Invalid string token format                           |
      | [TODAY]              | 200        | ParsedToken | today                                                 |
      | [TODAY-1YEAR-1MONTH] | 200        | ParsedToken | one year and one month ago from today                 |
      | [TODAY+1YEAR-2MONTH] | 200        | ParsedToken | one year ahead and two months ago from today          |
