# API Automation Smoke Tests POC

**Updated: 06/11/25**

This repository hosts three end-to-end API automation demos that exercise a shared Token Parser API idea:

- **DEMOAPP001 - TypeScript / Express / Cypress** (`_API_TESTING_GHERKIN_/DEMOAPP001_TYPESCRIPT_CYPRESS`)
- **DEMOAPP002 - .NET 8 Minimal API / SpecFlow / Playwright** (`_API_TESTING_GHERKIN_/DEMOAPP002_CSHARP_PLAYWRIGHT`)
- **DEMOAPP003 - TypeScript / Express / Playwright BDD** (`_API_TESTING_GHERKIN_/DEMOAPP003_TYPESCRIPT_PLAYWRIGHT`)

Each stack exposes Swagger documentation, provides scripted start-and-test flows, and demonstrates how token parsing utilities drive automated checks. All runtimes now share a configurable logging abstraction so verbosity can be tuned via configuration or environment variables (see `TOKENPARSER_LOG_LEVEL` for TypeScript projects and `TokenParser:Logging:Level` for the .NET API).

---

## Quick Start

### DEMOAPP001 - TypeScript API + Cypress

1. `cd _API_TESTING_GHERKIN_/DEMOAPP001_TYPESCRIPT_CYPRESS`
2. `npm install`
3. Start the API: `npm run start`  
   - Swagger UI: `http://localhost:3000/swagger/v1/json`  
   - OpenAPI JSON: `http://localhost:3000/swagger/v1/swagger.json`  
   - OpenAPI YAML: `http://localhost:3000/swagger/v1/swagger.yaml`
4. Run tests: `npx cypress run` (results recorded by `.batch/RUN_DEMOAPP001_TYPESCRIPT_CYPRESS_API_AND_TESTS.BAT`)

The batch script launches the API on port `3000`, waits for readiness, opens Swagger automatically, runs Cypress, and stores results under `.results/demoapp001_typescript_cypress_*.txt`.

### DEMOAPP002 - .NET API + SpecFlow/Playwright

1. `cd _API_TESTING_GHERKIN_/DEMOAPP002_CSHARP_PLAYWRIGHT`
2. `dotnet restore TokenParserAPI.sln`
3. Start the API: `dotnet run --project TokenParserAPI --urls http://localhost:5228`  
   - Swagger UI: `http://localhost:5228/swagger/v1/json`  
   - OpenAPI JSON: `http://localhost:5228/swagger/v1/swagger.json`  
   - OpenAPI YAML: `http://localhost:5228/swagger/v1/swagger.yaml`
4. Run tests: `dotnet test TokenParserTests --no-build`

Use `.batch/RUN_DEMOAPP002_CSHARP_PLAYWRIGHT_API_AND_TESTS.BAT` to orchestrate the same workflow automatically (includes Playwright dependency bootstrap and Swagger launch). Log verbosity is controlled through `TokenParser:Logging:Level` or the `TOKENPARSER_LOG_LEVEL` environment variable.

### DEMOAPP003 - TypeScript API + Playwright BDD

1. `cd _API_TESTING_GHERKIN_/DEMOAPP003_TYPESCRIPT_PLAYWRIGHT`
2. `npm install`
3. Start the API: `npm run start`  
   - Swagger UI: `http://localhost:3001/swagger/v1/json`
4. Run tests: `npm test` (`cucumber-js` with Playwright request fixtures)

`.batch/RUN_DEMOAPP003_TYPESCRIPT_PLAYWRIGHT_API_AND_TESTS.BAT` spins up the API on port `3001`, sets `API_BASE_URL` for tests, opens Swagger, executes the BDD suite, and saves output to `.results/demoapp003_typescript_playwright_*.txt`.

---

## Token Parser API Endpoints

All stacks expose the same contract:

| Endpoint | Method | Description | Success (200) | Error (400) |
| --- | --- | --- | --- | --- |
| `/alive` | GET | Lightweight health indicator | `{ "Status": "ALIVE-AND-KICKING" }` | N/A |
| `/parse-dynamic-string-token` | GET | Generates strings from tokens such as `[ALPHA-NUMERIC-LEN-10]` (optionally `-LINES-n`) | `{ "ParsedToken": "<generated>" }` | `{ "Error": "Invalid string token format" }` |
| `/parse-date-token` | GET | Parses relative or range-based date tokens and normalises to UTC | `{ "ParsedToken": "yyyy-MM-dd HH:mm:ssZ" }` | `{ "Error": "Invalid string token format" }` |

Shared implementations now emit structured log messages through the new logging abstraction; increase verbosity when debugging token parsing issues, or set the level to `silent` for noise-free CI runs.

---

## Repository Layout

- `README.md` (this guide)
- `_API_TESTING_GHERKIN_/DEMOAPP001_TYPESCRIPT_CYPRESS/`
  - `src/server.ts` - Express API entry point with Swagger configuration and logging
  - `src/tokenparser/` - Date and dynamic string parser implementations
  - `cypress/` - BDD feature files, step definitions, and Cypress config
- `_API_TESTING_GHERKIN_/DEMOAPP002_CSHARP_PLAYWRIGHT/`
  - `TokenParserAPI/Program.cs` - Minimal API host with Swagger UI and logging configuration
  - `TokenParserAPI/utils/` - Token parsing utilities with logger integration
  - `TokenParserTests/` - SpecFlow feature files and Playwright test project
- `_API_TESTING_GHERKIN_/DEMOAPP003_TYPESCRIPT_PLAYWRIGHT/`
  - `src/server.ts`, `src/tokenparser/`, `features/` - Playwright BDD server and Screenplay test harness
  - `tooling/` - Cucumber + Playwright configs and reporting scripts
  - `docs/` - Architecture, QA strategy, and Screenplay guidelines
- `.batch/` - Automation scripts (start API, open Swagger, run tests, capture output)
- `API Testing POC/` - Supporting documentation and comparison guides

---

## Build Artifacts

Generated content under `*/bin`, `*/obj`, `.playwright/`, and `node_modules/` is safe to ignore (covered by `.gitignore`).

---

## Additional Documentation

- API Testing POC/typescript_cucumber_cypress.md - Full breakdown of the Cypress stack
- API Testing POC/typescript_playwright_cucumber.md - Full breakdown of the TypeScript + Playwright stack
- API Testing POC/csharp_specflow_playwright.md - Full breakdown of the C# + Playwright stack
- API Testing POC/testing_guidelines_3_a.md - Process and testing guidance
- API Testing POC/api_testing_comparison.md - Cross-stack comparisons and rationale

