Feature: API Health Check Endpoint
  As a system user, 
  I want to receive a confirmation that the API is alive
  So I can verify that the API is operational

  Scenario: Verifying the API responds successfully to a health check
    Given the API is available
    When a GET request is made to the Alive Endpoint
    Then the API response should return a status code of 200
    And the Alive Endpoint response body should contain "Status" with the value "ALIVE-AND-KICKING"
	