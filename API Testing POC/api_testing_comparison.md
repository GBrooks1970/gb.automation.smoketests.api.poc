# Comparison Report: Testing APIs using BDD/Gherkin User Stories and Contract Testing

## Overview

A report that compares two different approaches to API testing using BDD and Contract Testing principles. Both strategies aim to test API endpoints documented in Swagger/OpenAPI, leveraging a domain-specific language (DSL) for writing test cases in a natural-language style. This allows for requirements, or more specifically, the understanding of the requirements, to evolve and change throughout the life of a project and be documented in a manner that encourages collaboration between developers, QA, and non-technical or business stakeholders.

The approaches are:

- **Typescript/Cucumber/Cypress**
- **C#/SpecFlow/Playwright**

---

## Approach #1: Typescript/Cucumber/Cypress

### Pros

- **Natural Language Test Authoring (Gherkin):** Utilizes Cucumber for writing BDD-style test cases in Gherkin, making tests more understandable to non-technical stakeholders.
- **Strong Type Safety (Typescript):** Typescript adds static typing to JavaScript, reducing runtime errors and improving code quality.
- **Mature Testing Ecosystem (Cypress):** Cypress is widely used for both frontend and API testing, offering a fast execution environment and real-time test monitoring.
- **Comprehensive Testing Support:** Supports a wide range of testing scenarios (UI, API, and end-to-end tests) within one framework.
- **Easy Setup and Integration:** Cypress has a simple setup for API testing with good support for testing against Swagger/OpenAPI documentation.
- **Rich Debugging Capabilities:** Cypress provides automatic snapshots and a rich debugging environment that makes it easy to trace issues in API calls.

### Cons

- **Lesser Focus on API-First Development:** Cypressâ€™ primary focus is not API testing; may lack features for API-first strategies like contract testing.
- **Scalability Concerns:** Being browser-centric, Cypress may become less efficient for complex or high-volume API test suites.
- **Limited Parallelization:** Test execution slows with large suites due to limited support for multi-machine parallelization.

---

## Approach #2: C#/SpecFlow/Playwright

### Pros

- **Natural Language Test Authoring (Gherkin):** SpecFlow offers Gherkin syntax for BDD-style test cases, bridging technical and non-technical teams.
- **Strong Type Safety and Performance (C#):** Strongly-typed models, performance-oriented, robust for large-scale testing.
- **Powerful API Testing Features (Playwright):** Supports frontend and API testing, strong for RESTful APIs and contract testing.
- **Parallel Test Execution:** Native parallelization support improves speed for large test suites.
- **Better Integration with Swagger/OpenAPI:** Mature libraries for easier contract validation and automated schema checks.

### Cons

- **Higher Learning Curve:** Requires familiarity with C# and SpecFlow.
- **Longer Setup Time:** More complex setup compared to Cypress.
- **Less Community Support:** Smaller community compared to the Cucumber/Cypress ecosystem.

---

## Summary of Key Considerations

| Factor                   | Typescript/Cucumber/Cypress | C#/SpecFlow/Playwright |
|--------------------------|------------------------------|-------------------------|
| Test Case Authoring       | Gherkin via Cucumber; readable but less API-focused | Gherkin via SpecFlow; strong domain-driven support |
| Language                  | Typescript; less strict but popular | C#; strict typing, high performance |
| API Testing Focus         | Limited, UI-centric | Strong API & contract support |
| Swagger/OpenAPI Integration | Basic via plugins | Advanced, integrated support |
| Parallel Execution        | Limited | Strong support |
| Performance               | Generally fast | Generally fast |
| Community/Ecosystem       | Large (Cucumber/Cypress) | SpecFlow mature; Playwright smaller |
| Ease of Setup             | Faster | More configuration required |
| Debugging/Reporting       | Strong snapshots, real-time | Detailed logs and tracing |
| Learning Curve            | Low | High |

---

## Conclusion

- **Typescript/Cucumber/Cypress:**
  - Great for ease of use, quick setup, JS/TS teams, UI + basic API tests.
  - Ideal for fast feedback loops and lightweight API validation.
  - Less suited for API-first or contract testing focus.

- **C#/SpecFlow/Playwright:**
  - Strong for API-first development, contract validation, scalability.
  - Suited for .NET teams with API-heavy projects.
  - Higher setup cost, but provides robustness and advanced capabilities.

---

## Benefits of Testing APIs using BDD/Gherkin Basic Smoke Tests

- **Clear & Concise:** Readable for all stakeholders using Given-When-Then.
- **Core Functionality Focused:** Validate critical endpoints quickly.
- **Simplicity:** Each test validates a basic operation.
- **Collaboration-Friendly:** Product owners, QA, and developers can all contribute.
- **Ease of Maintenance:** High-level tests require minimal code changes.
- **Fast Feedback:** Quick execution, perfect for CI/CD pipelines.

### Why BDD/Gherkin for Smoke Tests?

- **Reusable:** Across environments.
- **Ensures Operational Readiness:** Validates endpoints before deeper tests.
- **Promotes Collaboration:** Common, natural language.
- **Streamlined Execution:** Lightweight, efficient.
- **Accessible:** Everyone can read/write scenarios.

---

## Example Test Approach

API Endpoints documented in Swagger/OpenAPI, with BDD/Gherkin contract testing.

### Endpoints

- `/alive` (GET): Health checker.
- `/parse-dynamic-string-token` (GET): Outputs computed string.
- `/parse-date-token` (GET): Outputs computed date.

### Swagger/OpenAPI (Simplified)

```yaml
openapi: 3.0.0
info:
  title: Example API
  version: 1.0.0
paths:
  /alive:
    get:
      summary: Health check endpoint
      responses:
        '200':
          description: API is alive and functioning
          content:
            application/json:
              schema:
                type: object
                properties:
                  Status:
                    type: string
                    example: "ALIVE-AND-KICKING"
```

---

## BDD/Gherkin User Stories for API Testing

### Scenario 1: Check if the API is alive

```gherkin
Feature: API Health Check Endpoint
  As an API consumer
  I want to confirm the API is alive
  So I can verify it is operational

  Scenario: API responds successfully
    Given the API is available
    When a GET request is made to /alive
    Then the response status should be 200
    And the body should contain "Status" = "ALIVE-AND-KICKING"
```

### Scenario 2: Parse a dynamic string token

```gherkin
Feature: Parse Dynamic String Token Endpoint
  As an API consumer
  I want valid tokens parsed into strings
  So I can use the API for dynamic parsing

  Scenario: Valid token parsing
    Given a valid token "[exampleDynamicToken]" is provided
    When GET /parse-dynamic-string-token with token
    Then status = 200
    And body contains "ParsedToken" = "generatedstring"

  Scenario: Invalid token parsing
    Given an invalid token "invalidToken" is provided
    When GET /parse-dynamic-string-token with token
    Then status = 400
    And body contains "Error" = "Invalid string token format"
```

### Scenario 3: Parse a date token

```gherkin
Feature: Parse Date Token Endpoint
  As an API consumer
  I want valid date tokens parsed into formatted dates
  So I can use the API for date parsing

  Scenario: Valid date token
    Given a valid token "[exampleDateToken]" is provided
    When GET /parse-date-token with token
    Then status = 200
    And body contains "ParsedToken" = "generateddate"
    And "ParsedToken" matches format yyyy-MM-dd HH:mm:ssZ

  Scenario: Invalid date token
    Given an invalid token "invalidDate" is provided
    When GET /parse-date-token with token
    Then status = 400
    And body contains "Error" = "Invalid string token format"
```

---

## Declarative Style Explanation

- **Given:** Precondition/context.
- **When:** Action/event.
- **Then:** Expected outcome.

Focus is on *what* the system does, not *how*.

---

## Pseudo Code Summary (Code-Base Agnostic)

### Setup

```pseudo
BeforeAll:
  Init API base URL (Swagger/OpenAPI)
  Init HTTP client

BeforeEach:
  Prepare headers & query params
```

### Tests

- **Alive Test:** GET /alive — assert status=200, body contains "Status" = "ALIVE-AND-KICKING".
- **Dynamic Token Parser:** GET /parse-dynamic-string-token — assert 200 + parsed value.
- **Date Token Parser:** GET /parse-date-token — assert 200 + parsed date.

### Teardown

```pseudo
AfterEach:
  Reset client session

AfterAll:
  Cleanup resources
```

---

## Key Concepts

- **Declarative Gherkin:** Readable, outcome-driven.
- **Contract Testing:** Response validation against Swagger/OpenAPI.
- **Test Coverage:** Core endpoints validated.

This approach is adaptable to both **Typescript/Cucumber/Cypress** and **C#/SpecFlow/Playwright** while staying consistent with BDD and contract testing principles.
