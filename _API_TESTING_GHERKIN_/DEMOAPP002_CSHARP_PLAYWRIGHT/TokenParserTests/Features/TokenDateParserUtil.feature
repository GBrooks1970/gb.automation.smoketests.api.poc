@utiltests
Feature: Parsing dates from token format strings using TokenDateParser

    In order to accurately compute dates from token format strings
    As a user of the TokenDateParser class
    I want to be able to input a variety of token strings and get the correct date output

    Scenario: Parsing today - [STARTDATE][+ve/-ve][DATEPART][+ve/-ve][DATEPART][+ve/-ve][DATEPART]
        Given A date token "[TODAY]"
        When I parse the token
        Then the result should be today's date

    Scenario: Parsing tomorrow - [STARTDATE][+ve/-ve][DATEPART][+ve/-ve][DATEPART][+ve/-ve][DATEPART]
        Given A date token "[TOMORROW]"
        When I parse the token
        Then the result should be tomorrow's date

    Scenario: Parsing yesterday - [STARTDATE][+ve/-ve][DATEPART][+ve/-ve][DATEPART][+ve/-ve][DATEPART]
        Given A date token "[YESTERDAY]"
        When I parse the token
        Then the result should be yesterday's date

    Scenario: Parsing today minus two year and four month - [STARTDATE][+ve/-ve][DATEPART][+ve/-ve][DATEPART][+ve/-ve][DATEPART]
        Given A date token "[TODAY-2YEAR-4MONTH]"
        When I parse the token
        Then the result should be today's date minus two year and four month

    Scenario: Parsing today minus one year and one month - [STARTDATE][+ve/-ve][DATEPART][+ve/-ve][DATEPART][+ve/-ve][DATEPART]
        Given A date token "[TODAY-1YEAR-1MONTH]"
        When I parse the token
        Then the result should be today's date minus one year and one month

    Scenario: Parsing today minus one year, two months, and three days - [STARTDATE][+ve/-ve][DATEPART][+ve/-ve][DATEPART][+ve/-ve][DATEPART]
        Given A date token "[TODAY-1YEAR-2MONTH-3DAY]"
        When I parse the token
        Then the result should be today's date minus one year, two months, and three days

    Scenario: Parsing today plus one year, minus one month, and plus one day - [STARTDATE][+ve/-ve][DATEPART][+ve/-ve][DATEPART][+ve/-ve][DATEPART]
        Given A date token "[TODAY+1YEAR-1MONTH+1DAY]"
        When I parse the token
        Then the result should be today's date plus one year, minus one month, and plus one day

    Scenario: Parsing today plus two years - [STARTDATE][+ve/-ve][DATEPART][+ve/-ve][DATEPART][+ve/-ve][DATEPART]
        Given A date token "[TODAY+2YEAR]"
        When I parse the token
        Then the result should be today's date plus two years

    Scenario: Parsing today plus five months - [STARTDATE][+ve/-ve][DATEPART][+ve/-ve][DATEPART][+ve/-ve][DATEPART]
        Given A date token "[TODAY+5MONTH]"
        When I parse the token
        Then the result should be today's date plus five months

    Scenario: Parsing tomorrow plus five months - [STARTDATE][+ve/-ve][DATEPART][+ve/-ve][DATEPART][+ve/-ve][DATEPART]
        Given A date token "[TOMORROW+5MONTH]"
        When I parse the token
        Then the result should be tomorrow's date plus five months

    Scenario: Parsing yesterday plus five months and minus one year - [STARTDATE][+ve/-ve][DATEPART][+ve/-ve][DATEPART][+ve/-ve][DATEPART]
        Given A date token "[YESTERDAY+5MONTH-1YEAR]"
        When I parse the token
        Then the result should be yesterday's date plus five months and minus one year

    Scenario: Handling null or invalid token input - [STARTDATE][+ve/-ve][DATEPART][+ve/-ve][DATEPART][+ve/-ve][DATEPART]
        Given An invalid date range string "INVALID-TOKEN"
        When I parse the token
        Then an error should be thrown with message "Invalid string token format"
