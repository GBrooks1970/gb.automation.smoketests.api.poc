# DEMOAPP002 - .NET Token Parser API + SpecFlow Playwright

Minimal API host (`TokenParserAPI`) with SpecFlow + Playwright automation (`TokenParserTests`). This stack mirrors the TypeScript implementations while proving Screenplay parity on .NET.

---

## Contents

```
TokenParserAPI/          # ASP.NET Core Minimal API (Program.cs, utils/, logging/)
TokenParserTests/        # SpecFlow + NUnit + Playwright Screenplay project
docs/                    # Architecture, QA strategy, Screenplay guidance
RUN_API*.bat             # Convenience scripts for local smoke runs
RUN_TESTS.bat            # Executes TokenParserTests
```

---

## Prerequisites

- .NET SDK 8.x
- PowerShell or Command Prompt
- Playwright browsers (installed automatically by the tests or via `pwsh playwright.ps1 install`)

---

## Restore and Run the API

```powershell
cd _API_TESTING_GHERKIN_/DEMOAPP002_CSHARP_PLAYWRIGHT
dotnet restore TokenParserAPI.sln
dotnet run --project TokenParserAPI --urls http://localhost:5228
```

Swagger endpoints:

- UI redirect: `http://localhost:5228/swagger/`
- JSON: `http://localhost:5228/swagger/v1/swagger.json`
- YAML: `http://localhost:5228/swagger/v1/swagger.yaml`

You can also run `RUN_API.bat` (builds first) or `RUN_API_BUILD.bat` (explicit build + run).

---

## Running Tests

```powershell
dotnet test TokenParserTests --no-build
```

- Util scenarios carry `[Category("utiltests")]` so they can run in isolation.
- Playwright dependencies are installed by calling the generated `playwright.ps1` script in `TokenParserTests/bin/Debug/net8.0/` (handled automatically by `.batch/RUN_DEMOAPP002_CSHARP_PLAYWRIGHT_API_AND_TESTS.BAT`).
- Screenplay actors are created in `TokenParserTests/Screenplay/Support/ScreenplayHooks.cs`; hooks attach `CallAnApi` and `UseTokenParsers` abilities so the bindings match the TypeScript stacks.

---

## One-Step Automation (Windows)

```bat
call .batch\RUN_DEMOAPP002_CSHARP_PLAYWRIGHT_API_AND_TESTS.BAT
```

This script:

1. Loads environment defaults (port 5228, base URL).
2. Starts the API when the port is free and opens Swagger.
3. Runs util tests (`dotnet test --filter "TestCategory=utiltests"`).
4. Ensures Playwright browsers are installed.
5. Runs the full SpecFlow suite and writes logs to `.results/demoapp002_csharp_playwright_<UTC>.txt`.
6. Stops the API it started.

---

## Documentation

- `docs/ARCHITECTURE.md` - describes the Minimal API, logging, and endpoint contract.
- `docs/QA_STRATEGY.md` - covers tagging, risk-based prioritisation, and reporting.
- `docs/SCREENPLAY_GUIDE.md` - explains the hook setup, actors, abilities, and tasks for SpecFlow.
