# DEMOAPP002 – .NET Playwright Architecture Guide

**Version 2 – 18/11/25**

## 1. Overview
- **API Host**: .NET 8 Minimal API (`TokenParserAPI`) hosting the Token Parser endpoints plus Swagger.
- **Automation Stack**: SpecFlow + .NET Playwright bindings running Screenplay-inspired steps (actors built inside SpecFlow hooks).
- **Role in Parity**: Serves as the .NET counterpart to DEMOAPP001/003, consuming the same Scenario Outline data and logging requirements.

## 2. Key Components
| Component | Location | Notes |
| --- | --- | --- |
| Token Parser services | `TokenParserAPI/utils/*.cs` | Date/dynamic string parsers; logging level via `TokenParser:Logging:Level`. |
| HTTP Host | `TokenParserAPI/Program.cs` | Minimal API wiring, Swagger, health endpoints. |
| Test Project | `TokenParserTests/` | SpecFlow feature files, generated glue, Screenplay helpers, Playwright request helpers. |
| Batch scripts | `_API_TESTING_GHERKIN_/DEMOAPP002_CSHARP_PLAYWRIGHT/*.bat` | Start API (`RUN_API.bat`) and execute tests (`RUN_TESTS.bat`). |

## 3. Architecture Walkthrough
1. `dotnet run --project TokenParserAPI` boots the API (default port 5228) and exposes `/swagger` + parser endpoints.
2. SpecFlow/Playwright tests (driven by `.batch/RUN_DEMOAPP002_CSHARP_PLAYWRIGHT_API_AND_TESTS.BAT`) run util scenarios first (`TestCategory=utiltests`) then full API suites.
3. Request helpers (`RequestHelper.cs` for HttpClient, `RequestHelper_PW.cs` for Playwright) encapsulate HTTP interactions and align with Screenplay patterns.
4. Logs from both API and SpecFlow runs are piped into `.results/demoapp002_csharp_playwright_*.txt`; orchestrator consumes these for metrics.

## 4. Folder Map
```
DEMOAPP002_CSHARP_PLAYWRIGHT
├─ docs/ (architecture, QA, Screenplay)
├─ TokenParserAPI/
│  ├─ Program.cs
│  ├─ utils/
│  └─ Properties/launchSettings.json
├─ TokenParserTests/
│  ├─ Features/*.feature
│  ├─ Screenplay/ (actors, abilities, hooks)
│  ├─ Helpers/RequestHelper(_PW).cs
│  └─ specflow.json
├─ RUN_API.bat / RUN_TESTS.bat
└─ .results/ (created by batch runs)
```

## 5. Integration Points
- **Batch Orchestrator**: `.batch/RUN_ALL_API_AND_TESTS.BAT` calls this stack last. Ports are probed before launching to honour `SKIP_API_START`.
- **Swagger Contracts**: `API Testing POC/DEMO_DOCS/tokenparser_api_contract.md` references this host. Keep OpenAPI annotations in sync.
- **Screenplay Parity**: `API Testing POC/DEMO_DOCS/screenplay_parity_demoapps.md` lists required abilities/tasks/memory keys. Update docs/code when changes land.
- **Logging Review**: `API Testing POC/DEMO_DOCS/logging_review_v1_20251112.md` covers the .NET logging abstraction (Serilog-style structured fields). Ensure new middleware honours those rules.

## 6. Operational Notes
- Use `dotnet format --verify-no-changes` and Roslyn analyzers before test runs.
- `npx playwright install` must be executed once per environment (documented in README and invoked when the BAT script detects missing browsers).
- When swapping parser implementations, update both `TokenParserAPI/utils` and SpecFlow assertion helpers to keep deterministic UTC formatting.
- Metrics rely on TRX results and console summaries; avoid changing logger message formats without updating `.batch/.ps/render-run-metrics.ps1`.
