# DEMOAPP002 - .NET 8 Minimal API / SpecFlow / Playwright

**Version 2 - [06/11/25]**

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
- **Testing**: SpecFlow BDD scenarios backed by Playwright drivers.
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
- `dotnet test TokenParserTests --no-build` - executes the SpecFlow + Playwright suite.
- `.batch/RUN_DEMOAPP002_CSHARP_PLAYWRIGHT_API_AND_TESTS.BAT` - automates the full workflow and writes results to `.results/demoapp002_csharp_playwright_<UTC_TIMESTAMP>.txt`.

---

## Logging Configuration

Logging level is controlled via `TokenParser:Logging:Level` (appsettings) or the `TOKENPARSER_LOG_LEVEL` environment variable. Supported values: `Silent`, `Error`, `Warn`, `Info`, `Debug`.

---

## Testing Notes

- Playwright API calls run headlessly; no browser context is required.
- SpecFlow scenarios mirror the REST contract and utility tests from the other stacks.
- Batch runs open Swagger automatically for quick manual verification.

---

## References

- Main README: `README.md`
- Cypress stack: `API Testing POC/typescript_cucumber_cypress.md`
- Playwright TypeScript stack: `API Testing POC/typescript_playwright_cucumber.md`
- Token contract: `API Testing POC/tokenparser_api_contract.md`

---

## Screenplay Parity Plan

| Layer | Current State (DEMOAPP002) | Planned Work |
| --- | --- | --- |
| Actor abstraction | SpecFlow step classes manage `_response`, `_token` fields manually; no Actor concept. | Introduce a `ScreenplayContext` service registered per scenario that exposes an Actor with abilities. |
| Abilities | HTTP traffic handled by `RequestHelper`; parser utilities invoked directly. | Wrap HttpClient + parser access as abilities (`CallAnApi`, `UseTokenParsers`) to mirror the Playwright TypeScript implementation. |
| Tasks | RequestHelper exposes methods but not Screenplay-style tasks. | Create task classes (e.g., `SendGetRequestTask`) so steps invoke `actor.AttemptsTo(...)`. |
| Questions | Assertions operate on raw JSON via `JsonDocument`. | Add question helpers (status, body fields) that match the semantics of `ResponseStatus`/`ResponseJson`. |
| Memory | Step classes store state in private fields which can leak across steps if not reset. | Store responses and context in Actor memory or SpecFlow `ScenarioContext` extensions to align with the Playwright Screenplay pattern. |

**Milestones**
1. Add Screenplay scaffolding project (Actor, Abilities, Tasks, Questions) under `TokenParserTests/Screenplay`.
2. Gradually migrate SpecFlow bindings to the new abstractions, starting with the Alive endpoint.
3. Mirror progress in the Cypress doc so all stacks converge on the same Screenplay terminology and capabilities.
