# DEMOAPP002 - .NET 8 Minimal API / SpecFlow / Playwright

**Version 3 - [10/11/25]**

The `_API_TESTING_GHERKIN_/DEMOAPP002_CSHARP_PLAYWRIGHT/TokenParserAPI` solution hosts the TOKENPARSER API on `http://localhost:5228`. Swagger UI is enabled and the service is validated through SpecFlow feature files executed with Playwright.

---

## Token Parser API Endpoints

1. **GET `/alive`**
   - Purpose: Confirms the API host is healthy.
   - Success (200): `{ "Status": "ALIVE-AND-KICKING" }`

2. **GET `/parse-dynamic-string-token`**
   - Query: `token` (string, required) in the `[TYPE-LIST]-LEN-<length>[-LINES-<count>]` format.
   - Success (200): `{ "ParsedToken": "<generated string>" }`
   - Error (400): `{ "Error": "Invalid string token format" }`

3. **GET `/parse-date-token`**
   - Query: `token` (string, required) describing relative or range-based dates.
   - Success (200): `{ "ParsedToken": "yyyy-MM-dd HH:mm:ssZ" }`
   - Error (400): `{ "Error": "Invalid string token format" }`

---

## Swagger / OpenAPI

- Swagger UI: `http://localhost:5228/swagger/v1/json`
- Raw OpenAPI JSON: `http://localhost:5228/swagger/v1/swagger.json`
- Raw OpenAPI YAML: `http://localhost:5228/swagger/v1/swagger.yaml`

---

## Stack Highlights

- **Runtime**: .NET 8 minimal API with Swashbuckle for Swagger generation.
- **Testing**: SpecFlow BDD scenarios backed by Playwright drivers; util feature files execute before API tests and mirror the TypeScript Scenario Outlines.
- **Token Utilities**: `TokenDateParser` and `TokenDynamicStringParser` classes reused by the API and tests.
- **Automation**: `.batch/RUN_DEMOAPP002_CSHARP_PLAYWRIGHT_API_AND_TESTS.BAT` starts the API, ensures Playwright dependencies, opens Swagger, executes tests, and stops the host.

---

## Project Layout

```
_API_TESTING_GHERKIN_/DEMOAPP002_CSHARP_PLAYWRIGHT/
- TokenParserAPI/
  - Program.cs (minimal API host + Swagger + logging configuration)
  - utils/ (token parsing utilities)
- TokenParserTests/
  - Features/ (SpecFlow feature files)
  - Steps/ (Playwright bindings)
- .batch/ (automation scripts)
- .results/ (timestamped run outputs)
- TokenParserAPI.sln / project files
```

---

## Scripts and Automation

- `dotnet run --project TokenParserAPI --urls http://localhost:5228` - starts the API.
- `dotnet test TokenParserTests --no-build --filter "TestCategory=utiltests"` - runs util parser coverage (called automatically by the batch script).
- `dotnet test TokenParserTests --no-build` - executes the SpecFlow + Playwright suite for API scenarios.
- `.batch/RUN_DEMOAPP002_CSHARP_PLAYWRIGHT_API_AND_TESTS.BAT` - automates the full workflow and writes results to `.results/demoapp002_csharp_playwright_<UTC_TIMESTAMP>.txt`.

---

## Logging Configuration

Logging level is controlled via `TokenParser:Logging:Level` (appsettings) or the `TOKENPARSER_LOG_LEVEL` environment variable. Supported values: `Silent`, `Error`, `Warn`, `Info`, `Debug`.

---

## Testing Notes

- Playwright API calls run headlessly; no browser context is required.
- `TokenDateParserUtil.feature` (util tag) now executes before any HTTP scenarios and covers date ranges, date strings, and error states.
- Batch runs open Swagger automatically, record separate util/API result files under `.results/`, and fail fast if the util tests regress.
- Scenario Outlines for both `/parse-date-token` and `/parse-dynamic-string-token` share the same seven-row data tables as the TypeScript stacks.

---

## References

- Main README: `README.md`
- Cypress stack: `API Testing POC/typescript_cucumber_cypress.md`
- Playwright TypeScript stack: `API Testing POC/typescript_cucumber_playwright.md`
- Token contract: `API Testing POC/tokenparser_api_contract.md`

---

## Screenplay Parity Plan

| Layer | Current State (DEMOAPP002) | Next Action |
| --- | --- | --- |
| Actor abstraction | Step classes manage `_response`, `_token`, `_exception` fields manually. | Introduce a `ScreenplayContext`/Actor registered per scenario via dependency injection. |
| Abilities | HTTP traffic handled by `RequestHelper`; parsers invoked directly. | Wrap HttpClient + parser access as abilities (`CallAnApi`, `UseTokenParsers`). |
| Tasks | RequestHelper exposes imperative helpers only. | Create task classes (e.g., `SendGetRequestTask`) so steps call `actor.AttemptsTo(...)`. |
| Questions | Assertions inspect `JsonDocument` directly. | Add question helpers (status/body) to align with Cypress/Playwright semantics. |
| Memory | Private fields hold scenario state. | Store responses and parser results in Actor memory or `ScenarioContext` extensions. |

**Milestones**
1. Add Screenplay scaffolding project (Actor, Abilities, Tasks, Questions) under `TokenParserTests/Screenplay`.  
2. Migrate Alive endpoint bindings to the new abstractions as a template.  
3. Update this doc (and the Cypress/Playwright counterparts) as additional SpecFlow steps adopt Screenplay.
