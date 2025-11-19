# API Automation Smoke Tests POC

**Updated: 18/11/25**

This repository hosts four end-to-end API automation demos that exercise a shared Token Parser API idea:

- **DEMOAPP001 - TypeScript / Express / Cypress** (`_API_TESTING_GHERKIN_/DEMOAPP001_TYPESCRIPT_CYPRESS`)
- **DEMOAPP002 - .NET 8 Minimal API / SpecFlow / Playwright** (`_API_TESTING_GHERKIN_/DEMOAPP002_CSHARP_PLAYWRIGHT`)
- **DEMOAPP003 - TypeScript / Express / Playwright BDD** (`_API_TESTING_GHERKIN_/DEMOAPP003_TYPESCRIPT_PLAYWRIGHT`)
- **DEMOAPP004 - Python / FastAPI / Playwright Screenplay** (`_API_TESTING_GHERKIN_/DEMOAPP004_PYTHON_PLAYWRIGHT`)

Each stack exposes Swagger documentation, provides scripted start-and-test flows, and demonstrates how token parsing utilities drive automated checks. All runtimes now share a configurable logging abstraction so verbosity can be tuned via configuration or environment variables (see `TOKENPARSER_LOG_LEVEL` for the JavaScript stacks and `TokenParser:Logging:Level` for the .NET API).

Automation scripts for these stacks live under `.batch/`. See **`API Testing POC/DEMO_DOCS/batch_runner_design.md`** for the formal design spec covering the orchestrator, per-project runners, helper utilities, and run metrics.

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

### DEMOAPP004 - Python FastAPI + Playwright Screenplay

1. `cd _API_TESTING_GHERKIN_/DEMOAPP004_PYTHON_PLAYWRIGHT`
2. `python -m venv .venv && .\.venv\Scripts\Activate`
3. `pip install -e .[dev] && python -m playwright install`
4. Start the API: `python -m src.server`  
   - Swagger UI: `http://localhost:3002/docs`  
   - OpenAPI JSON: `http://localhost:3002/openapi.json`
5. Run util tests: `pytest -m util`  
6. Run API tests: `pytest -m api`

`.batch/RUN_DEMOAPP004_PYTHON_PLAYWRIGHT_API_AND_TESTS.BAT` applies the same lifecycle as the TypeScript stacks (load env, port probe, start API/Swagger, run util + API suites, capture `.results/demoapp004_python_playwright_*.txt` logs). The runner intentionally shells through `playwright.cmd` to avoid .NET CLI conflicts and documents the behaviour in the project README.

> **Note:** Always run `python -m playwright install` from the activated virtual environment so Playwright discovers the Python project (running `playwright install` without the `python -m` shim will default to the .NET CLI and fail).

---

## Automation & Metrics

To execute every stack in sequence, run:

```powershell
.batch\RUN_ALL_API_AND_TESTS.BAT
```

The orchestrator:

1. Invokes each per-project runner (util suite first, then main API tests) across all four demos.
2. Starts/stops APIs unless the relevant port is already in use (`SKIP_API_START` safeguards shared dev environments).
3. Captures log paths and exit codes for each suite.
4. Produces three artefacts per run inside `.results/`:
   - `run_metrics_<UTC>.metrics` – raw key/value pairs (`<Label>_Exit=<code>`, `<Label>_Log=<path>`, `OverallExit=<code>`).
   - `run_metrics_<UTC>.txt` – ASCII summary table (Suite, Exit, Tests, Passed, Failed, Skipped, Duration, Log).
   - `run_metrics_<UTC>.md` – Markdown version of the summary table for PR comments or Confluence.

Treat these files as the single source of truth for automation health; each entry links directly to the underlying suite log. A full design spec (orchestrator, warm-up helper, per-project runners, renderer expectations, and change-management rules) lives in `API Testing POC/DEMO_DOCS/batch_runner_design.md`.

For manual API verification without executing tests, run:

```powershell
.batch\RUN_ALL_APIS_AND_SWAGGER.BAT
```

This helper starts the Express, FastAPI, and .NET APIs, opens Swagger/Docs, waits for a keypress, then tears everything down. It shares the same boot logic described in the batch-runner design spec so manual workflows match automated ones.

---

## Token Parser API Endpoints

All stacks expose the same contract:

| Endpoint | Method | Description | Success (200) | Error (400) |
| --- | --- | --- | --- | --- |
| `/alive` | GET | Lightweight health indicator | `{ "Status": "ALIVE-AND-KICKING" }` | N/A |
| `/parse-dynamic-string-token` | GET | Generates strings from tokens such as `[ALPHA-NUMERIC-LEN-10]` (optionally `-LINES-n`) | `{ "ParsedToken": "<generated>" }` | `{ "Error": "Invalid string token format" }` |
| `/parse-date-token` | GET | Parses relative or range-based date tokens and normalises to UTC | `{ "ParsedToken": "yyyy-MM-dd HH:mm:ssZ" }` | `{ "Error": "Invalid string token format" }` |

Shared implementations now emit structured log messages through the logging abstraction; increase verbosity when debugging token parsing issues, or set the level to `silent` for noise-free CI runs.

---

## Repository Layout

- `README.md` (this guide)
- `_API_TESTING_GHERKIN_/DEMOAPP001_TYPESCRIPT_CYPRESS/`
  - `package.json` - Scripts proxy to the shared `@demoapps/tokenparser-api-shared` workspace
  - `cypress/` - BDD feature files, step definitions, and Cypress config
- `_API_TESTING_GHERKIN_/DEMOAPP002_CSHARP_PLAYWRIGHT/`
  - `TokenParserAPI/Program.cs` - Minimal API host with Swagger UI and logging configuration
  - `TokenParserAPI/utils/` - Token parsing utilities with logger integration
  - `TokenParserTests/` - SpecFlow feature files and Playwright test project
- `_API_TESTING_GHERKIN_/DEMOAPP003_TYPESCRIPT_PLAYWRIGHT/`
  - `package.json` - Scripts proxy to the shared `@demoapps/tokenparser-api-shared` workspace
  - `features/` - Cucumber specs orchestrated via Playwright + Screenplay helpers
  - `tooling/` - Cucumber + Playwright configs and reporting scripts
  - `docs/` - Architecture, QA strategy, and Screenplay guidelines
- `packages/tokenparser-api-shared/`
  - `src/` - Shared Express host, parsers, configuration, and logging utilities consumed by the TypeScript demo apps
  - `dist/` - Build output generated via `npm run build --workspace @demoapps/tokenparser-api-shared`
- `_API_TESTING_GHERKIN_/DEMOAPP004_PYTHON_PLAYWRIGHT/`
  - `src/server.py`, `src/tokenparser/` - FastAPI host plus shared date/dynamic parser ports
  - `tests/features/` - pytest-bdd suites mirroring DEMOAPP001 scenarios with Screenplay actors
  - `docs/ARCHITECTURE.md`, `QA_STRATEGY.md`, `SCREENPLAY_GUIDE.md` - parity and ISTQB rationale for the Python stack
- `.batch/` - Automation scripts (per-project runners, orchestrator, helpers)
- `API Testing POC/` - Supporting documentation and comparison guides

---

## Build Artifacts

Generated content under `*/bin`, `*/obj`, `.playwright/`, and `node_modules/` is safe to ignore (covered by `.gitignore`).

---

## Additional Documentation

- API Testing POC/typescript_cucumber_cypress.md - Full breakdown of the Cypress stack
- API Testing POC/typescript_cucumber_playwright.md - Full breakdown of the TypeScript + Playwright stack
- API Testing POC/csharp_specflow_playwright.md - Full breakdown of the C# + Playwright stack
- API Testing POC/DEMO_DOCS/DEMOAPP004_blueprint.md - Blueprint + requirements traceability for the Python stack
- API Testing POC/testing_guidelines_3_a.md - Process and testing guidance
- API Testing POC/api_testing_comparison.md - Cross-stack comparisons and rationale
- API Testing POC/DEMO_DOCS/batch_runner_design.md - Detailed specs for the orchestrator, API warm-up helper, per-project runners, and metrics artefacts
- API Testing POC/DEMO_DOCS/screenplay_parity_demoapps.md - Screenplay parity rules across all stacks

---

## Design References

Consult the following when creating or updating a demo:

1. `API Testing POC/DEMO_DOCS/batch_runner_design.md` - orchestrator, API warm-up helper, per-project runner, and metrics specifications (Version 4).
2. `API Testing POC/DEMO_DOCS/new_demo_requirements.md` - acceptance checklist for any new DEMOAPP.
3. `API Testing POC/DEMO_DOCS/screenplay_parity_demoapps.md` - consolidated Screenplay parity matrix and dataset source of truth (Version 3).
4. Per-project docs under `_API_TESTING_GHERKIN_/DEMOAPP00x_*/docs/` - architecture, QA strategy, and Screenplay guides for each stack.



