# DEMOAPP002 - .NET 8 Minimal API / SpecFlow / Playwright

**Version 7 - [17/11/25]**

`_API_TESTING_GHERKIN_/DEMOAPP002_CSHARP_PLAYWRIGHT` contains the ASP.NET Core Token Parser API (`TokenParserAPI`) and the SpecFlow + Playwright Screenplay tests (`TokenParserTests`). The host listens on `http://localhost:5228`, exposes Swagger, and reuses the same parser utilities as the TypeScript stacks.

---

## Contract Summary

| Path | Notes |
| --- | --- |
| `GET /alive` | Returns `{ "Status": "ALIVE-AND-KICKING" }`. |
| `GET /parse-dynamic-string-token` | Accepts `token` query string and returns `{ "ParsedToken": "<string>" }` or `{ "Error": "Invalid string token format" }`. |
| `GET /parse-date-token` | Resolves date tokens to `yyyy-MM-dd HH:mm:ssZ`. |

Swagger endpoints: `http://localhost:5228/swagger/`, `/swagger/v1/swagger.json`, `/swagger/v1/swagger.yaml`.

---

## Layout

```
_API_TESTING_GHERKIN_/DEMOAPP002_CSHARP_PLAYWRIGHT/
  docs/                Architecture, QA, Screenplay guides
  TokenParserAPI/      Minimal API host, logging, utilities
  TokenParserTests/    SpecFlow features, Screenplay hooks, tasks, questions
  .batch/              Automation helpers
  .results/            Timestamped run outputs
  TokenParserAPI.sln
```

---

## Quick Start

```powershell
cd _API_TESTING_GHERKIN_/DEMOAPP002_CSHARP_PLAYWRIGHT
dotnet restore TokenParserAPI.sln
dotnet run --project TokenParserAPI --urls http://localhost:5228
```

Run tests:

```powershell
dotnet test TokenParserTests --no-build
```

Util-only coverage:

```powershell
dotnet test TokenParserTests --no-build --filter "TestCategory=utiltests"
```

`ScreenplayHooks` provisions an actor per scenario, attaching `CallAnApi` (Playwright `HttpClient`) and `UseTokenParsers` abilities. Tasks (`SendGetRequest`, `ParseDateTokenLocally`, `ParseDynamicStringTokenLocally`) and questions (`ResponseStatus`, `ResponseJson`, parser helpers) mirror the TypeScript stacks.

---

## Automation Scripts

| Script | Description |
| --- | --- |
| `.batch/RUN_DEMOAPP002_CSHARP_PLAYWRIGHT_API_AND_TESTS.BAT` | Loads `.env`, starts the API when port 5228 is free, opens Swagger, runs util tests, installs Playwright browsers if needed, runs the full SpecFlow suite, and stops the API. Logs land in `.results/demoapp002_csharp_playwright_<UTC>.txt`. |
| `.batch/RUN_ALL_API_AND_TESTS.BAT` | Orchestrates all stacks, capturing this suite's exit code/log path inside `run_metrics_<UTC>.{metrics,txt,md}`. |
| `.batch/RUN_ALL_APIS_AND_SWAGGER.BAT` | Starts the TypeScript API hosts plus this Minimal API for manual verification. |

---

## Testing Notes

- SpecFlow features (`TokenParserTests/Features`) mirror the Cypress/Playwright tables row for row.
- Playwright API tests run without launching a browser window.
- Util scenarios tagged `Category=utiltests` run before the API suite in automation to fail fast on parser regressions.
- Logs are written to `.results/` with UTC timestamps so the metrics renderer can summarise them alongside the other stacks.

---

## Logging & Config

- `TokenParser:Logging:Level` (or `TOKENPARSER_LOG_LEVEL`) controls log verbosity (`Silent`, `Error`, `Warn`, `Info`, `Debug`).
- `appsettings.Development.json` documents the base URL/port; `env_utils.bat` reads `.env` overrides before automation runs.

---

## References

- Main README
- `_API_TESTING_GHERKIN_/DEMOAPP002_CSHARP_PLAYWRIGHT/docs`
- Companion docs: `typescript_cucumber_cypress.md`, `typescript_cucumber_playwright.md`, `python_playwright.md`
- Contract + automation specs: `tokenparser_api_contract.md`, `batch_runner_design.md`, `screenplay_parity_demoapps.md`
