@util
Feature: TokenDateParser Utilities
  Scenario Outline: Parse token locally
    Given I have the date token "<token>"
    When I parse the token locally
    Then the local date parser should succeed = <valid>

    Examples:
      | token                | valid |
      | [TODAY]              | true  |
      | [TODAY-1YEAR-2MONTH] | true  |
      | INVALIDTOKEN         | false |
