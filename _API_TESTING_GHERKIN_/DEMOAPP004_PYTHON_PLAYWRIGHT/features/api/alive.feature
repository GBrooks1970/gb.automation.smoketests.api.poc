Feature: API Health Check Endpoint
  As a consumer
  I want to confirm the API is alive
  So that I can trust subsequent contract tests

  Scenario: API responds successfully to a health check
    Given the Token Parser API is available
    When I send a GET request to "/alive"
    Then the response status should be 200
    And the response body field "Status" should equal "ALIVE-AND-KICKING"
