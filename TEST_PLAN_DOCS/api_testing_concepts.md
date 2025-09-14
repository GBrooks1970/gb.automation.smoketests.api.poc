# API / Microservices Testing Concepts

## Manual Testing Concepts

- **Understand the API Contract**

  - Review Swagger/OpenAPI specification
  - Identify available endpoints, request methods, headers, and response codes

- **Authentication & Authorization**

  - Test token-based authentication (e.g., OAuth, Bearer tokens)
  - Validate role-based access control

- **Functional Validation**

  - Verify endpoint functionality with valid and invalid data
  - Check for correct response structure and status codes

- **Boundary & Negative Testing**

  - Use edge cases for parameters (e.g., null, max/min values)
  - Validate error handling and messages

- **Data Integrity Testing**

  - Ensure database updates match API transactions (If database access is possible)
  - Cross-check values against known data (data listing?)

- **Exploratory Testing**

  - Attempt unexpected actions (e.g., using GET where POST is expected)
  - Identify missing validations

## Automated Testing Concepts

- **Contract Testing**

  - Use tools such as Postman, Pact, or Swagger Validator to ensure conformance to API contracts (PostMan/Newman used)

- **Unit Testing of Services** *(Out of Scope)*

  - Test individual service methods with mock dependencies (embedded in code)

- **Integration Testing** *(Out of Scope)*

  - Test how microservices interact via internal/external APIs
  - Simulate real data flow across services

- **End-to-End (E2E) Testing (C#/SpecFlow/Resharper)**

  - Validate complete business flows across APIs and downstream services

- **Schema Validation** *(Out of Scope)*

  - Automate checks for request/response schema conformance

- **Load & Performance Testing**

  - Use tools like JMeter or k6 to simulate high-volume traffic
  - Measure latency, throughput, and error rates

- **Security Testing** *(Out of Scope)*

  - Scan for vulnerabilities (e.g., OWASP API Top 10)
  - Test for rate-limiting, injection attacks, and data exposure

- **CI/CD Integration** *(Out of Scope)*

  - Run API tests as part of build pipelines
  - Fail builds on test regressions or contract violations

## Tools/Libraries Used

- Manual: Postman, Swagger UI
- Automated: Newman, Specflow, Resharper
