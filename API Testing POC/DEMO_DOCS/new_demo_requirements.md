# New Demo Acceptance Criteria - Token Parser Automation Stack  
_Version 2 - 15/11/25_

This document is the source of truth for implementing any future "DEMOAPPxxx" stack. A demo is considered **complete** only when it satisfies all requirements below. Use this checklist before opening PRs and during design reviews.

---

## 1. API Contract Compliance

### Endpoints
1. **GET `/alive`**  
   - Returns `200` with `{ "Status": "ALIVE-AND-KICKING" }`.
2. **GET `/parse-dynamic-string-token`**  
   - Query: `token=[TYPE-LIST]-LEN-<n>[-LINES-<m>]`.  
   - Returns `200` with `{ "ParsedToken": "<generated string>" }` for valid tokens.  
   - Returns `400` with `{ "Error": "Invalid string token format" }` for invalid tokens.
3. **GET `/parse-date-token`**  
   - Query: `token=<relative-or-range>` (see existing demos for exact formats).  
   - Returns `200` with `{ "ParsedToken": "yyyy-MM-dd HH:mm:ssZ" }` or `400` with `{ "Error": "Invalid string token format" }`.

### Swagger / OpenAPI
- Expose Swagger UI + JSON + YAML (or the FastAPI equivalent) at `/swagger/v1/...` or framework defaults.
- Keep schemas in sync with `API Testing POC/tokenparser_api_contract.md`.
- Include startup logs showing the host URL and swagger endpoints.

---

## 2. Screenplay Architecture

### Actors & Worlds
- Provide a per-scenario actor (e.g., via Cucumber world, Cypress custom world, SpecFlow hooks, pytest fixtures).
- Actor factory must attach:
  - `CallAnApi` ability (wrapping the stack’s HTTP client).
  - `UseTokenParsers` ability (access to date/string parsers).

### Tasks
- Implement `SendGetRequest` (or equivalent) to send REST calls.
- Util tasks (`ParseDateTokenLocally`, etc.) must reuse the same parser implementations as the API.

### Questions & Memory
- Provide questions for `ResponseStatus` and `ResponseBody/Json`.
- Store last response + util results using consistent memory keys (mirroring existing stacks).

---

## 3. Test Coverage & Features

### Feature Files
- Reuse the existing Scenario Outlines (7 rows per API endpoint, full util tables).  
  - Optionally source test data from shared JSON/YAML for future consolidation.
- Include both API tests (`@API`) and util parser tests (`@UTILTEST` or equivalent tag).

### Execution
- Util suite must run before API suite in automation scripts.
- Tests must pass deterministically (no flaky data; rely on UTC).

---

## 4. Automation Scripts

### Per-project Runner
- Follow `API Testing POC/DEMO_DOCS/batch_runner_design.md`.
- Steps (in order):
  1. Load env vars (`env_utils.bat` or language equivalent).
  2. Check port usage (`Test-PortInUse.ps1`). Support `SKIP_API_START=1`.
  3. Start API and poll `/alive` until ready.
  4. Open Swagger in a background process.
  5. Run util tests (fail fast on errors).
  6. Run API tests.
  7. Stop API if the runner started it.
  8. Write success/failure summary with log paths.

### Orchestrator Integration
- Update `.batch/RUN_ALL_API_AND_TESTS.BAT` to include the new script.
- Ensure logs land in `.results/<demo-specific>_<UTC>.txt`.
- The metrics renderer must be able to parse the log (add support if format differs).

---

## 5. Metrics & Reporting

- Every orchestrated run must produce `run_metrics_<UTC>.{metrics,txt,md}` referencing the new demo.
- `.txt`/`.md` tables must include:
  - Suite name (e.g., "New Demo - Stack Name").
  - Run time (if available), Tests, Pass, Fail, Pending, Skip counts.
  - Log path.
- Update `API Testing POC/DEMO_DOCS/batch_runner_design.md` to reflect the addition.

---

## 6. Documentation Requirements

1. **README.md** - Add the new demo to the quick start list and automation overview.
2. **Project Doc** (`API Testing POC/DEMO_DOCS/<stack>.md`) - Duplicate the structure used by the existing stacks: endpoints, Swagger info, highlights, scripts, parity status.
3. **Screenplay Parity Note** - Update `API Testing POC/DEMO_DOCS/screenplay_parity_typescript.md` (or the C#/future-language equivalent) with actor/task/ability additions.
4. **Comparison Report** - Update `API Testing POC/api_testing_comparison.md` with pros/cons + references.

No demo is "done" without documentation reflecting its current state.

---

## 7. Quality Gates

- **Lint / Formatter / Type Check**: Provide scripts analogous to `npm run lint`, `dotnet format`, etc., ensuring CI can enforce quality.
- **Health Checks**: Batch scripts must fail fast if util suite or API suite fails.
- **Logs**: Each run produces readable logs (ASCII) and, ideally, a machine-readable artefact (JSON) for metrics parsing.

---

## 8. Optional Enhancements (Highly Encouraged)
- OpenAPI schema validation as part of the suite.
- JSON metrics per suite (eliminates log scraping).
- Shared test data (single source of truth for Scenario Outline tables).
- Chaos tests (port contention, API restart) to validate runner resilience.

---

**Checklist (updated 15/11/25):**

- [x] API contract endpoints implemented + Swagger ready (`_API_TESTING_GHERKIN_/DEMOAPP004_PYTHON_PLAYWRIGHT/src/server.py`).
- [x] Screenplay actor/ability/task/question/memory in place (`tests/screenplay/**`, mirrored from DEMOAPP001).
- [x] Feature files cloned with Scenario Outlines aligned (`tests/features/api` + `tests/features/util-tests`).
- [x] Per-project runner follows the standard lifecycle (`.batch/RUN_DEMOAPP004_PYTHON_PLAYWRIGHT_API_AND_TESTS.BAT`).
- [x] Orchestrator updated and metrics renderer supports the logs (`.batch/RUN_ALL_API_AND_TESTS.BAT`, `.batch/.ps/render-run-metrics.ps1`).
- [x] Documentation updated (README, project doc set, parity note, comparison report, design spec).
- [x] Quality gates & health checks implemented (lint/format tasks + batch failure handling documented in `_API_TESTING_GHERKIN_/DEMOAPP004_PYTHON_PLAYWRIGHT/README.md`).

When all boxes are checked, the new demo meets the acceptance criteria for inclusion in this repository.
