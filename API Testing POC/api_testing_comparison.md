# Comparison Report: Token Parser Automation Stacks

**Version 4 - [12/11/25]**

## Overview

This report compares the three active automation stacks that validate the Token Parser API using BDD + contract-testing principles. All stacks exercise the same Swagger contract, share test narratives, and—where possible—reuse Screenplay abstractions to keep behaviour consistent. Use this document to pick the appropriate stack for a feature, or to understand how parity is maintained across projects.

The stacks are:

1. **TypeScript / Cypress / Cucumber (DEMOAPP001)**
2. **TypeScript / Playwright / Cucumber (DEMOAPP003)**
3. **C# / SpecFlow / Playwright (DEMOAPP002)**

---

## Approach #1: TypeScript / Cypress / Cucumber (DEMOAPP001)

### Pros

- **Natural Language Test Authoring (Gherkin):** Utilizes Cucumber for writing BDD-style test cases in Gherkin, making tests more understandable to non-technical stakeholders.
- **Strong Type Safety (Typescript):** Typescript adds static typing to JavaScript, reducing runtime errors and improving code quality.
- **Mature Testing Ecosystem (Cypress):** Cypress is widely used for both frontend and API testing, offering a fast execution environment and real-time test monitoring.
- **Comprehensive Testing Support:** Supports a wide range of testing scenarios (UI, API, and end-to-end tests) within one framework.
- **Easy Setup and Integration:** Cypress has a simple setup for API testing with good support for testing against Swagger/OpenAPI documentation.
- **Rich Debugging Capabilities:** Cypress provides automatic snapshots and a rich debugging environment that makes it easy to trace issues in API calls.

### Cons

- **Postinstall Friction:** `npx cypress verify` still fails on some CI agents; installs run with `--ignore-scripts` and verification happens manually.
- **Browser-Centric Runtime:** Still optimized for UI flows; large API-only suites can be slower compared to leaner runners.
- **Limited Native Parallelisation:** Requires Cypress Dashboard for distributed execution.

### References

- Project doc: `API Testing POC/DEMO_DOCS/typescript_cucumber_cypress.md`
- Screenplay parity note: `API Testing POC/DEMO_DOCS/screenplay_parity_typescript.md`
- Architecture/QA docs: `_API_TESTING_GHERKIN_/DEMOAPP001_TYPESCRIPT_CYPRESS/docs`

---

## Approach #2: TypeScript / Playwright / Cucumber (DEMOAPP003)

### Pros

- **Playwright API Fixtures:** Lightweight HTTP client with trace capture and deterministic context disposal.
- **Shared Screenplay Pattern:** Mirrors Cypress implementation (actors/abilities/tasks/questions) and forms the reference design for new helpers.
- **Tooling & Docs:** Dedicated architecture/QA/Screenplay docs plus ESLint/Prettier gates ensure Screenplay code stays healthy.
- **Batch Automation:** `.batch/RUN_DEMOAPP003_TYPESCRIPT_PLAYWRIGHT_API_AND_TESTS.BAT` (and `RUN_ALL_APIS_AND_SWAGGER.BAT`) start/stop the API and capture `.results/` logs automatically.

### Cons

- **No Browser Specs Yet:** `npm run pw:test` is prepped but unused; UI coverage would require additional investment.
- **Node-Only:** Still dependent on Node.js ecosystem; .NET teams may prefer the C# stack for deeper integration tests.

### References

- Project doc: `API Testing POC/DEMO_DOCS/typescript_cucumber_playwright.md`
- Architecture/QA docs: `_API_TESTING_GHERKIN_/DEMOAPP003_TYPESCRIPT_PLAYWRIGHT/docs`
- Screenplay parity note: `API Testing POC/DEMO_DOCS/screenplay_parity_typescript.md`

---

## Approach #3: C# / SpecFlow / Playwright (DEMOAPP002)

### Pros

- **Natural Language Test Authoring (Gherkin):** SpecFlow offers Gherkin syntax for BDD-style test cases, bridging technical and non-technical teams.
- **Strong Type Safety and Performance (C#):** Strongly-typed models, performance-oriented, robust for large-scale testing.
- **Powerful API Testing Features (Playwright):** Supports frontend and API testing, strong for RESTful APIs and contract testing.
- **Parallel Test Execution:** Native parallelization support improves speed for large test suites.
- **Better Integration with Swagger/OpenAPI:** Mature libraries for easier contract validation and automated schema checks.

### Cons

- **Screenplay Pending:** Step bindings still manage state manually; adoption plan tracked in `_API_TESTING_GHERKIN_/DEMOAPP002_CSHARP_PLAYWRIGHT/docs/SCREENPLAY_GUIDE.md`.
- **Longer Setup:** Requires .NET SDK + Playwright dependencies; faster iteration lives in the TypeScript stacks.
- **Smaller Community:** SpecFlow + Playwright combination is less common than Cypress/Cucumber.

### References

- Project doc: `API Testing POC/DEMO_DOCS/csharp_specflow_playwright.md`
- Architecture/QA docs: `_API_TESTING_GHERKIN_/DEMOAPP002_CSHARP_PLAYWRIGHT/docs`

---

## Summary of Key Considerations

| Factor | TS/Cypress | TS/Playwright | C#/SpecFlow |
| --- | --- | --- | --- |
| Test Authoring | Gherkin (Cucumber) | Gherkin (Cucumber) | Gherkin (SpecFlow) |
| Language | TypeScript | TypeScript | C# (.NET 8) |
| Screenplay status | Complete parity with Playwright stack | Reference implementation | Planned (migration guide published) |
| API Focus | High (Screenplay-driven) | High (Screenplay-driven) | High (contract source of truth) |
| Swagger Integration | Auto via Express + Swashbuckle | Same | ASP.NET Core Swashbuckle |
| Tooling Gates | `lint`, `format`, `ts:check`, `verify` | `lint`, `format`, `ts:check`, `verify` | `dotnet format`, `dotnet test` |
| Batch Automation | `RUN_DEMOAPP001_TYPESCRIPT_CYPRESS_API_AND_TESTS.BAT` | `RUN_DEMOAPP003_TYPESCRIPT_PLAYWRIGHT_API_AND_TESTS.BAT` | `RUN_DEMOAPP002_CSHARP_PLAYWRIGHT_API_AND_TESTS.BAT` |
| Parallel Execution | Limited (Cypress Dashboard) | Playwright sharding ready | Native via `dotnet test -m` |
| Install Caveats | `npm install --ignore-scripts` due to Cypress verify | None | Requires `npx playwright install` |

---

## Conclusion

- **TypeScript / Cypress** remains the quickest entry point for JS-focused teams and now mirrors the Playwright Screenplay implementation.
- **TypeScript / Playwright** is the reference Screenplay implementation and the most flexible path for API-first work or future UI/API hybrid suites.
- **C# / SpecFlow** anchors the contract (source-of-truth API) and provides a .NET-native automation path; its next milestone is adopting the same Screenplay abstractions documented in the TypeScript stacks.

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

- **Alive Test:** GET /alive - assert status=200, body contains "Status" = "ALIVE-AND-KICKING".
- **Dynamic Token Parser:** GET /parse-dynamic-string-token - assert 200 + parsed value.
- **Date Token Parser:** GET /parse-date-token - assert 200 + parsed date.

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

