# DEMOAPP002 C# Architecture Blueprint

**Version 1 - [12/11/25]**

## Stack Snapshot
- **Runtime**: .NET 8 (C#) solution containing an ASP.NET Core Web API (`TokenParserAPI`) and a SpecFlow + NUnit test project (`TokenParserTests`).
- **Pattern**: BDD-style feature files executed through SpecFlow bindings. Tests currently rely on helper classes (`RequestHelper`, `UrlHelper`) rather than the Screenplay abstraction, but follow the same business narratives as the TypeScript stacks.
- **API Host**: `TokenParserAPI` exposes the `/alive`, `/parse-date-token`, and `/parse-dynamic-string-token` endpoints that every stack consumes for parity.
- **Automation Alignment**: Batch scripts (`RUN_API.bat`, `RUN_TESTS.bat`, solution-level `.batch` harnesses) keep execution consistent with the TypeScript projects so parity checks can run from a single command.

## Solution Layout
```
DEMOAPP002_CSHARP_PLAYWRIGHT
|--- docs/
|    |--- ARCHITECTURE.md
|    |--- QA_STRATEGY.md
|    `--- SCREENPLAY_GUIDE.md        <- documents current BDD binding pattern + gaps to Screenplay
|--- TokenParserAPI/
|    |--- Program.cs
|    |--- Controllers/
|    |--- Services/
|    `--- appsettings*.json
|--- TokenParserTests/
|    |--- Features/                  <- SpecFlow .feature files
|    |--- Steps/                     <- Binding classes (NUnit assertions + helpers)
|    |--- Helpers/                   <- HttpClient wrappers, date utilities, memory helpers
|    |--- specflow.json              <- generator & glue configuration
|    `--- TokenParserTests.csproj
|--- TokenParserAPI.sln
|--- RUN_API.bat / RUN_API_BUILD.bat
|--- RUN_TESTS.bat / TokenParserTests/TestResults
```

## Tooling & Automation
- **dotnet CLI**:
  - `dotnet restore` and `dotnet run --project TokenParserAPI` for the API.
  - `dotnet test TokenParserTests` executes the SpecFlow suite, producing TRX files under `TokenParserTests/TestResults/`.
- **Playwright Dependency**: Tests reference Microsoft.Playwright packages to enable future browser/API automation. Run `npx playwright install` (or `pwsh .\RUN_TESTS.bat`, which invokes `dotnet test`) when browsers are needed.
- **Batch files**:
  - `RUN_API.bat` starts the API (optionally via `RUN_API_BUILD.bat` to pre-build).
  - `RUN_TESTS.bat` wraps `dotnet test` and ensures Playwright drivers exist.
  - Repository-level `.batch/RUN_ALL_APIS_AND_SWAGGER.BAT` uses these scripts (through `env_utils.bat`) so the C# host participates in multi-stack smoke runs.

## Shared Concepts with TypeScript Stacks
- **Feature Files**: `TokenParserTests/Features/ParseDateToken_Endpoint.feature` mirrors the Cypress and Playwright BDD specs, ensuring wording remains identical for parity reporting.
- **Token Parser Logic**: Source-of-truth lives in the C# API; TypeScript stacks consume cloned implementations for local util tests, so any change here must be ported to `_API_TESTING_GHERKIN_/DEMOAPP00{1,3}` `src/tokenparser`.
- **Ports & Env Vars**: Default port `5228` must match `.env` values consumed by `RUN_ALL_APIS_AND_SWAGGER.BAT` and TypeScript `.env` files. Update `TokenParserAPI/appsettings.Development.json` and `.batch/env_utils.bat` together.

## Extension Hooks
- **Swagger / Contracts**: `TokenParserAPI` uses Swashbuckle. Swagger docs should remain aligned with `API Testing POC/tokenparser_api_contract.md`.
- **Telemetry**: Add Serilog or Application Insights instrumentation if richer observability is required; share the approach in the QA strategy doc for consistency across stacks.
- **Screenplay Future**: While the C# suite currently uses direct helper calls, the docs highlight how to migrate to a Screenplay-like abstraction (see `docs/SCREENPLAY_GUIDE.md`) to keep all stacks conceptually aligned.

## References
- TypeScript parity overview: `API Testing POC/screenplay_parity_typescript.md`.
- Cypress docs: `_API_TESTING_GHERKIN_/DEMOAPP001_TYPESCRIPT_CYPRESS/docs`.
- Playwright docs: `_API_TESTING_GHERKIN_/DEMOAPP003_TYPESCRIPT_PLAYWRIGHT/docs`.
