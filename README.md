# API Automation Smoke Tests POC

**Updated: 04/11/25**

This repository hosts two end-to-end API automation demos that exercise a shared Token Parser API idea:

- **TypeScript / Express / Cypress** (`_API_TESTING_GHERKIN_/DEMOAPP001_TYPESCRIPT_CYPRESS`)
- **.NET 8 Minimal API / SpecFlow / Playwright** (`_API_TESTING_GHERKIN_/DEMOAPP002_CSHARP_PLAYWRIGHT`)

Each stack exposes Swagger documentation, provides scripted start-and-test flows, and demonstrates how token parsing utilities drive automated checks.

---

## Quick Start

### TypeScript API + Cypress

1. `cd _API_TESTING_GHERKIN_/DEMOAPP001_TYPESCRIPT_CYPRESS`
2. `npm install`
3. Start the API: `npm run start`  
   - Swagger UI: `http://localhost:3000/swagger/v1/json`  
   - OpenAPI JSON: `http://localhost:3000/swagger/v1/swagger.json`  
   - OpenAPI YAML: `http://localhost:3000/swagger/v1/swagger.yaml`
4. Run tests: `npx cypress run` (results recorded by `.batch/RUN_API_AND_TESTS.BAT`)

The batch script `.\.batch\RUN_API_AND_TESTS.BAT` launches the API, waits for port readiness, opens Swagger automatically, runs Cypress, and stores results under `.results/`.

### .NET API + SpecFlow/Playwright

1. `cd _API_TESTING_GHERKIN_/DEMOAPP002_CSHARP_PLAYWRIGHT`
2. `dotnet restore TokenParserAPI.sln`
3. Start the API: `dotnet run --project TokenParserAPI --urls http://localhost:5228`  
   - Swagger UI: `http://localhost:5228/swagger/v1/json`  
   - OpenAPI JSON: `http://localhost:5228/swagger/v1/swagger.json`  
   - OpenAPI YAML: `http://localhost:5228/swagger/v1/swagger.yaml`
4. Run tests: `dotnet test TokenParserTests --no-build`

Use `.\.batch\RUN_CS_API_AND_TESTS.BAT` to orchestrate the same workflow automatically (includes Playwright dependency bootstrap and Swagger launch).

---

## Token Parser API Endpoints

Both stacks expose the same contract:

| Endpoint | Method | Description | Success (200) | Error (400) |
| --- | --- | --- | --- | --- |
| `/alive` | GET | Lightweight health indicator | `{ "Status": "ALIVE-AND-KICKING" }` | N/A |
| `/parse-dynamic-string-token` | GET | Generates strings from tokens such as `[ALPHA-NUMERIC-LEN-10]` (optionally `-LINES-n`) | `{ "ParsedToken": "<generated>" }` | `{ "Error": "Invalid string token format" }` (TypeScript variant appends context) |
| `/parse-date-token` | GET | Parses relative or range-based date tokens and normalises to UTC | `{ "ParsedToken": "yyyy-MM-dd HH:mm:ssZ" }` | `{ "Error": "Invalid string token format" }` (TypeScript variant appends context) |

Detailed behaviour is captured in stack-specific documentation (`API Testing POC/typescript_cucumber_cypress.md`, `API Testing POC/csharp_specflow_playwright.md`).

---

## Repository Layout

- `README.md` (this guide)
- `_API_TESTING_GHERKIN_/DEMOAPP001_TYPESCRIPT_CYPRESS/`
  - `src/server.ts` – Express API entry point with Swagger configuration
  - `src/tokenparser/` – Date and dynamic string parser implementations
  - `cypress/` – BDD feature files, step definitions, and Cypress config
- `_API_TESTING_GHERKIN_/DEMOAPP002_CSHARP_PLAYWRIGHT/`
  - `TokenParserAPI/Program.cs` – Minimal API host with Swagger UI
  - `TokenParserAPI/utils/` – Token parsing utilities
  - `TokenParserTests/` – SpecFlow feature files and Playwright test project
- `.batch/` – Automation scripts (start API, run tests, capture output)
- `API Testing POC/` – Supporting documentation and comparison guides

---

## Build Artifacts

Generated content under `*/bin`, `*/obj`, and `.playwright/` is safe to ignore. These paths are covered by `.gitignore`.

---

## Additional Documentation

- `API Testing POC/typescript_cucumber_cypress.md` – Full breakdown of the TypeScript stack
- `API Testing POC/csharp_specflow_playwright.md` – Full breakdown of the C# stack
- `API Testing POC/api_testing_comparison.md` – Cross-stack comparisons and rationale
