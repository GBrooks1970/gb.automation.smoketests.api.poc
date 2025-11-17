@api
Feature: Parse Date Token Endpoint
  As a consumer
  I want to resolve date tokens via the API
  So that I receive deterministic UTC timestamps

  Scenario Outline: Parse a date token
    Given a date token "<token>"
    When I send a GET request to "/parse-date-token" with the token query
    Then the response status should be <status>
    And the response should contain "<key>" with the value "<expectation>"

    Examples:
      | token                      | status | key         | expectation                                         |
      | INVALIDTOKEN               | 400    | Error       | Invalid string token format                         |
      | [TODAY]                    | 200    | ParsedToken | today                                               |
      | [TODAY-1YEAR-1MONTH]       | 200    | ParsedToken | one year and one month ago from today               |
      | [TODAY+1YEAR-2MONTH]       | 200    | ParsedToken | one year ahead and two months ago from today        |
      | [TOMORROW+3DAY]            | 200    | ParsedToken | tomorrow plus three days (four days from today)     |
      | [YESTERDAY-2DAY]           | 200    | ParsedToken | yesterday minus two days (three days ago)           |
      | [TODAY+2YEAR+6MONTH-15DAY] | 200    | ParsedToken | two years and six months ahead of today minus 15 days |
