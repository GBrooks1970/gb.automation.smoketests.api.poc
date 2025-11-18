# New Demo Acceptance Criteria - Token Parser Automation Stack
_Version 3 - 18/11/25_

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
  - `CallAnApi` ability (wrapping the stack's HTTP client).
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
- Source Scenario Outlines from the shared feature repository once available (see Backlog migration plan). Until it exists, reuse the canonical DEMOAPP001 tables (7 rows per API endpoint and the full util dataset).
- Include both API tests (`@API` or default) and util parser tests (`@UTILTEST` / `@util` tag).

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
  3. Start API and poll `/alive` until ready (or call the shared TypeScript API start script once migration happens).
  4. Open Swagger/docs in a background process.
  5. Run util tests (fail fast on errors).
  6. Run API tests.
  7. Stop API if the runner started it.
  8. Write success/failure summary with log paths (util + api) that the metrics renderer can parse.

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
3. **Screenplay Parity Note** - Update `API Testing POC/DEMO_DOCS/screenplay_parity_demoapps.md` with actor/task/ability additions covering every stack.
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

## 9. New Demo Planning Template
Use this template when scoping the next token parser automation stack (e.g., DEMOAPP005). Record plan status in `API Testing POC/DEMO_DOCS/New_Demo_Plan_Backlog.md`.

1. **Phase 0 – Discovery & Alignment**
   - Define runtime/tooling, confirm contract parity, and outline Screenplay obligations.
   - Acceptance: design brief reviewed by demo leads and logged in backlog.
2. **Phase 1 – API Host & Parsers**
   - Implement or integrate API endpoints (leveraging shared TypeScript API when applicable), logging, and Swagger exposure.
   - Acceptance: `/alive` responds, contract doc updated, logging verified (INFO/DEBUG).
3. **Phase 2 – Screenplay + Features**
   - Wire actors/abilities/tasks/questions/memory, import shared features, and enforce tagging strategy.
   - Acceptance: util + API suites pass locally, parity doc updated.
4. **Phase 3 – Automation & Metrics**
   - Build per-project runner (util-first), hook into `.batch/RUN_ALL_API_AND_TESTS.BAT`, ensure `.results` + metrics renderer understand new logs.
   - Acceptance: orchestrator run includes the new suite with accurate counts and log links.
5. **Phase 4 – Documentation & Quality Gates**
   - Update README, architecture/QA/Screenplay docs, contract references, comparison report, and parity backlog; establish lint/format/test commands.
   - Acceptance: docs merged, CI gates green, backlog notes future work.

---

**Checklist (updated 18/11/25):**

- [x] API contract endpoints implemented + Swagger ready (DEMOAPP001–004 reference implementations).
- [x] Screenplay actor/ability/task/question/memory in place across stacks.
- [x] Feature files align with canonical Scenario Outlines (shared repository migration in progress).
- [x] Per-project runners match the standard lifecycle (batch design spec v4).
- [x] Orchestrator + metrics renderer updated for all demos.
- [x] Documentation (README, architecture, QA, Screenplay, parity, comparison) up to date.
- [x] Quality gates & health checks enforced in CI.
- [x] New demo planning template recorded for future stacks.

When all boxes are checked, the new demo meets the acceptance criteria for inclusion in this repository.
