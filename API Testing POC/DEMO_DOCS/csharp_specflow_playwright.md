# DEMOAPP002 - .NET 8 Web API / SpecFlow / Playwright

**Version 5 - [12/11/25]**

The `_API_TESTING_GHERKIN_/DEMOAPP002_CSHARP_PLAYWRIGHT` solution hosts the Token Parser API on `http://localhost:5228`. Swagger UI is enabled and the service is validated through SpecFlow feature files executed with Playwright. Architecture, QA strategy, and Screenplay-alignment guides now live under `_API_TESTING_GHERKIN_/DEMOAPP002_CSHARP_PLAYWRIGHT/docs`.

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

- **Runtime**: .NET 8 Web API with Swashbuckle for Swagger generation.
- **Testing**: SpecFlow + NUnit scenarios backed by Playwright for HTTP calls; util feature files mirror the TypeScript Scenario Outlines.
- **Token Utilities**: `TokenDateParser` and `TokenDynamicStringParser` classes reused by the API and tests—the same logic mirrored in the TypeScript stacks.
- **Automation**: `.batch/RUN_DEMOAPP002_CSHARP_PLAYWRIGHT_API_AND_TESTS.BAT` (and `.batch/RUN_ALL_APIS_AND_SWAGGER.BAT`) start the API, ensure Playwright dependencies exist, open Swagger, run tests, and stop the host cleanly.
- **Documentation**: `_API_TESTING_GHERKIN_/DEMOAPP002_CSHARP_PLAYWRIGHT/docs` captures the current architecture, QA strategy, and the Screenplay migration plan required to align with the TypeScript stacks.
- **Screenplay Implementation**: All SpecFlow bindings now run through the Screenplay layer (`TokenParserTests/Screenplay/**`). Actors receive `CallAnApi` + `UseTokenParsers` abilities, HTTP/API tasks (`SendGetRequest`) and util tasks (`ParseDateTokenLocally`, `ParseDynamicStringTokenLocally`) mirror the TypeScript stacks.

---

## Project Layout

```
_API_TESTING_GHERKIN_/DEMOAPP002_CSHARP_PLAYWRIGHT/
|--- docs/                     (Architecture, QA, Screenplay alignment)
|--- TokenParserAPI/           (ASP.NET Core API host + Swagger)
|--- TokenParserTests/
|     |--- Features/           (SpecFlow feature files)
|     |--- Steps/              (Playwright bindings)
|     `--- Helpers/            (RequestHelper, UrlHelper, etc.)
|--- .batch/                   (automation scripts)
|--- .results/                 (timestamped run outputs)
`--- TokenParserAPI.sln
```

---

## Scripts and Automation

- `dotnet run --project TokenParserAPI --urls http://localhost:5228` - start the API locally.
- `dotnet test TokenParserTests --no-build --filter "TestCategory=utiltests"` - run util parser coverage (invoked automatically by the batch script).
- `dotnet test TokenParserTests --no-build` - execute SpecFlow + Playwright API scenarios.
- `.batch/RUN_DEMOAPP002_CSHARP_PLAYWRIGHT_API_AND_TESTS.BAT` - orchestrate API start, Swagger launch, util + API tests, and teardown while logging to `.results/demoapp002_csharp_playwright_<UTC_TIMESTAMP>.txt`.
- `.batch/RUN_ALL_APIS_AND_SWAGGER.BAT` - start all three demo APIs; recent fixes ensure the TypeScript hosts stop when the script exits.

---

## Logging Configuration

Logging level is controlled via `TokenParser:Logging:Level` (appsettings) or the `TOKENPARSER_LOG_LEVEL` environment variable. Supported values: `Silent`, `Error`, `Warn`, `Info`, `Debug`.

---

## Testing Notes

- Playwright API calls run headlessly; no browser context is required.
- `TokenDateParserUtil.feature` executes before API scenarios and covers the same range of positive/negative data as the TypeScript projects.
- Batch runs open Swagger automatically, record util + API results under `.results/`, and fail fast if util coverage regresses.
- Scenario Outlines for `/parse-date-token` and `/parse-dynamic-string-token` share the identical seven-row data tables used by DEMOAPP001/003.

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
| Actor abstraction | **Complete** – `ScreenplayHooks` provisions an actor + abilities for every scenario. | Continue extending abilities as new domains appear. |
| Abilities | **Complete** – `CallAnApi` and `UseTokenParsers` cover HTTP + local parser access. | Add future domain abilities as APIs grow. |
| Tasks | **Complete** – HTTP (`SendGetRequest`) and util (`Parse*TokenLocally`) tasks mirror TypeScript behaviour. | Introduce POST/PUT tasks when new endpoints land. |
| Questions | **Complete** – HTTP (`ResponseStatus`, `ResponseJson`) and util (`ParsedDateToken`, `ParsedStringToken`, `ParserExceptionMessage`) support all assertions. | Add domain questions as needed. |
| Memory | **Complete** – `MemoryKeys` tracks API results, parser output, and exceptions. | Expand only if new data needs to be shared. |

**Milestones**
1. ✅ Screenplay scaffolding + ability wiring under `TokenParserTests/Screenplay`.  
2. ✅ All SpecFlow bindings migrated (API + util scenarios).  
3. 🔁 Keep docs (`API Testing POC/DEMO_DOCS/*`, parity notes) in sync when new Screenplay helpers land.
