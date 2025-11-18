@util
Feature: Parsing dates from token format strings using TokenDateParser

  Scenario Outline: Parsing relative date tokens - [STARTDATE][+/-][DATEPART]...
    Given I have the date token "<token>"
    When I parse the date token locally
    Then the result should equal today plus <years> years <months> months <days> days

    Examples:
      | token                    | years | months | days |
      | [TODAY]                  | 0     | 0      | 0    |
      | [TOMORROW]               | 0     | 0      | 1    |
      | [YESTERDAY]              | 0     | 0      | -1   |
      | [TODAY-2YEAR-4MONTH]     | -2    | -4     | 0    |
      | [TODAY-1YEAR-1MONTH]     | -1    | -1     | 0    |
      | [TODAY-1YEAR-2MONTH-3DAY]| -1    | -2     | -3   |
      | [TODAY+1YEAR-1MONTH+1DAY]| 1     | -1     | 1    |
      | [TODAY+2YEAR]            | 2     | 0      | 0    |
      | [TODAY+5MONTH]           | 0     | 5      | 0    |
      | [TOMORROW+5MONTH]        | 0     | 5      | 1    |
      | [YESTERDAY+5MONTH-1YEAR] | -1    | 5      | -1   |

  Scenario: Handling invalid token input
    Given I have the date token "INVALID-TOKEN"
    When I parse the date token locally
    Then an error should be thrown with message "Invalid string token format"

  Scenario Outline: Parsing [MONTHENDSTART][MONTH][YEAR] tokens
    Given I have the date string "<dateStringToken>"
    When I parse the date string token locally
    Then the result should be "<expectedDate>"

    Examples:
      | dateStringToken       | expectedDate |
      | [START-JANUARY-2024]  | 2024-01-01   |
      | [END-FEBRUARY-2024]   | 2024-02-29   |
      | [END-FEBRUARY-2022]   | 2022-02-28   |
      | [END-OCTOBER-2020]    | 2020-10-31   |
      | [START-DECEMBER-2000] | 2000-12-01   |
      | [END-JUNE-2025]       | 2025-06-30   |

  Scenario Outline: Parsing date range tokens - [MONTHENDSTART][MONTH][YEAR]<->[MONTHENDSTART][MONTH][YEAR]
    Given I have the date range string "<dateRangeTokenString>"
    When I parse the date range string locally
    Then the start date should be "<StartDate>" and the end date should be "<EndDate>"

    Examples:
      | dateRangeTokenString                     | StartDate  | EndDate    |
      | [START-JANUARY-2024<->END-FEBRUARY-2024] | 2024-01-01 | 2024-02-29 |
      | [END-OCTOBER-2020<->END-FEBRUARY-2022]   | 2020-10-31 | 2022-02-28 |
      | [START-DECEMBER-2021<->END-JUNE-2025]    | 2021-12-01 | 2025-06-30 |
      | [START-JULY-2021<->START-MARCH-2023]     | 2021-07-01 | 2023-03-01 |
