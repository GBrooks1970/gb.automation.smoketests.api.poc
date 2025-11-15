Feature: TokenDynamicStringParser Utilities
  Scenario Outline: Generate local dynamic string
    Given I have the dynamic token "<token>"
    When I parse the dynamic token locally
    Then the local dynamic parser should return "<expectation>"

    Examples:
      | token                 | expectation              |
      | [ALPHA-3]             | regex:^[A-Za-z]{3}$      |
      | [NUMERIC-2-LINES-2]   | lines:2,length:2         |
