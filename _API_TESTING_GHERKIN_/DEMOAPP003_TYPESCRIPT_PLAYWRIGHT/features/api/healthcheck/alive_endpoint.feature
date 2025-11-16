Feature: API Health Check Endpoint
  As an API consumer
  I want to receive a confirmation that the API is alive
  So I can verify that the API is operational

  Scenario: API responds successfully to a health check
    Given the API is available
    When a GET request is made to the Alive Endpoint
    Then the API response should return a status code of 200
    And the Health Check response body should contain "Status" with the value "ALIVE-AND-KICKING"
