# DEMOAPP003 - TypeScript / Express / Playwright BDD

**Version 5 - [14/11/25]**

The `_API_TESTING_GHERKIN_/DEMOAPP003_TYPESCRIPT_PLAYWRIGHT` project hosts the Token Parser API on `http://localhost:3001`. It mirrors the shared token parsing utilities, exposes Swagger, and is validated through Playwright + Cucumber scenarios implemented with the Screenplay pattern. Documentation for architecture, QA strategy, and Screenplay conventions now lives under `_API_TESTING_GHERKIN_/DEMOAPP003_TYPESCRIPT_PLAYWRIGHT/docs`.

---

## Token Parser API Endpoints

1. **GET `/alive`**
   - Purpose: Lightweight health probe.
   - Success (200): `{ "Status": "ALIVE-AND-KICKING" }`

2. **GET `/parse-dynamic-string-token`**
   - Query: `token` (string, required) in the `[TYPE-LIST]-<LENGTH>[-LINES-<COUNT>]` format.
   - Success (200): `{ "ParsedToken": "<generated string>" }`
   - Error (400): `{ "Error": "Invalid string token format" }`

3. **GET `/parse-date-token`**
   - Query: `token` (string, required) describing anchor dates and adjustments.
   - Success (200): `{ "ParsedToken": "yyyy-MM-dd HH:mm:ssZ" }`
   - Error (400): `{ "Error": "Invalid string token format" }`

---

## Swagger / OpenAPI

- Swagger UI: `http://localhost:3001/swagger/v1/json`
- Raw OpenAPI JSON: `http://localhost:3001/swagger/v1/swagger.json`
- Raw OpenAPI YAML: `http://localhost:3001/swagger/v1/swagger.yaml`

`.batch/RUN_DEMOAPP003_TYPESCRIPT_PLAYWRIGHT_API_AND_TESTS.BAT` opens the Swagger UI automatically once the host is ready.

---

## Stack Highlights

- **Runtime**: Node.js + TypeScript (ES2022) served via Express with shared parser modules.
- **Testing**: Playwright `APIRequestContext` fixtures orchestrated with `@cucumber/cucumber`; Screenplay models actors, abilities, tasks, questions, and memory.
- **Configuration**: `.env.example` documents defaults including `API_BASE_URL=http://localhost:3001`, `PORT`, and logging verbosity controls.
- **Tooling**: ESLint + Prettier scope `src/`, `screenplay/`, and `features/**`; `npm run lint`, `npm run format`, and `npm run ts:check` form the quality gates before `npm run test:bdd` / `npm run verify`.
- **Automation**: `.batch/RUN_DEMOAPP003_TYPESCRIPT_PLAYWRIGHT_API_AND_TESTS.BAT` (and `.batch/RUN_ALL_APIS_AND_SWAGGER.BAT`) start/stop the API via `env_utils.bat`, open Swagger, run tests, and append summaries to `.results/`.
- **Orchestrator Support**: `.batch/RUN_ALL_API_AND_TESTS.BAT` consumes this runner, captures the latest `.results/demoapp003_typescript_playwright_<UTC>.txt` log, and records per-suite metrics (see `API Testing POC/DEMO_DOCS/batch_runner_design.md`).
- **Parity**: `UseTokenParsers`, `SendGetRequest`, and Screenplay memory are aligned with DEMOAPP001; `API Testing POC/screenplay_parity_typescript.md` tracks the shared status.

---

## Project Layout

```
_API_TESTING_GHERKIN_/DEMOAPP003_TYPESCRIPT_PLAYWRIGHT/
|--- docs/                     (Architecture, QA, Screenplay guides)
|--- screenplay/               (Actor, ability, task, question helpers)
|--- features/                 (api + util feature files and step defs)
|--- src/                      (Express host + token parsers + services)
|--- tooling/                  (cucumber runner, playwright config, summary script)
|--- .results/                 (timestamped batch outputs + cucumber json)
|--- package.json / tsconfig.json / .eslintrc.cjs / .prettierrc.json
```

---

## Scripts and Automation

- `npm start` / `npm run dev` - launch the Express API on port `3001`.
- `npm run lint`, `npm run format`, `npm run ts:check` - local quality gates.
- `npm run test:bdd` / `npm run verify` - execute Playwright + Cucumber suites (`verify` = type-check + test).
- `npm run pw:test` - reserved for future browser/e2e specs.
- `.batch/RUN_DEMOAPP003_TYPESCRIPT_PLAYWRIGHT_API_AND_TESTS.BAT` - start API, open Swagger, run util + API suites, produce `.results` logs, and persist `playwright_cucumber_report.json`.
- `.batch/RUN_ALL_API_AND_TESTS.BAT` - orchestrate all demo stacks, writing cross-suite metrics that reference this project's log path.
- `.batch/RUN_ALL_APIS_AND_SWAGGER.BAT` - start the three demo APIs and stop them cleanly once the session ends.

---

## Logging Configuration

`TOKENPARSER_LOG_LEVEL` controls verbosity:

- `debug` (default) - detailed parser telemetry for troubleshooting.
- `info` - high-level API lifecycle messages.
- `warn` or `error` - warning or error output only.
- `silent` - suppresses console output from the logger.

Set the value in `.env`, CI variables, or the shell environment before running scripts.

---

## Testing Notes

- Playwright `APIRequestContext` powers HTTP interactions; no browser context is required.
- Screenplay memory stores responses for `ResponseStatus`, `ResponseBody`, and util helpers via `UtilActorMemory`.
- Utility feature files mirror DEMOAPP001 coverage row-for-row, yielding 55 passing scenarios per run as of 2025‑11‑12.
- Batch runs capture deterministic UTC timestamps, open Swagger automatically, and dump a cucumber summary plus JSON report.

---

## References

- Main README: `README.md`
- Project docs: `_API_TESTING_GHERKIN_/DEMOAPP003_TYPESCRIPT_PLAYWRIGHT/docs`
- Cypress stack: `API Testing POC/typescript_cucumber_cypress.md`
- C# stack: `API Testing POC/csharp_specflow_playwright.md`
- Token contract: `API Testing POC/tokenparser_api_contract.md`

---

## Screenplay Mapping & Parity Plan

### DEMOAPP003 (TypeScript + Playwright) Mapping
- **Actors** - `screenplay/actors/Actor.ts` instantiated via `screenplay/support/custom-world.ts`. Each scenario's world provides a dedicated actor.
- **Abilities** - `CallAnApi` wraps Playwright's `APIRequestContext`; `UseTokenParsers` exposes direct util access.
- **Tasks** - `screenplay/tasks/SendGetRequest.ts` encapsulates GET calls; more tasks can be added for POST/PUT.
- **Questions** - `screenplay/questions/ResponseStatus.ts` / `ResponseJson.ts` expose response assertions.
- **Memory** - Actor's `remember`/`answer` stores the latest API response.

### Parity Plan

| Layer | DEMOAPP003 (TS+PW) | DEMOAPP001 (TS+Cypress) | DEMOAPP002 (C#+SpecFlow) | Next Step |
| --- | --- | --- | --- | --- |
| Actor setup | Complete | Complete | Pending | Introduce a SpecFlow `ScreenplayContext` service. |
| Abilities | Complete | Complete | Pending | Wrap HttpClient + parser access as abilities. |
| Tasks | Complete (`SendGetRequest` + parser helpers) | Complete (`SendGetRequest` mirrored) | Pending | Implement `SendGetRequestTask` (C#) & migrate steps. |
| Questions | Complete | Complete | Pending | Add question helpers to SpecFlow bindings. |
| Memory | Complete | Complete (`UtilActorMemory`) | Pending | Store values in Actor memory or `ScenarioContext`. |

### Milestones
1. **SpecFlow Screenplay bootstrap** – add Actor/Ability/Task/Question scaffolding under `TokenParserTests/Screenplay`.  
2. **Alive endpoint pilot** – migrate the health-check steps to the new abstractions, then expand across token scenarios.  
3. **Documentation sync** – keep this doc, the Cypress doc, and `_API_TESTING_GHERKIN_/DEMOAPP002_CSHARP_PLAYWRIGHT/docs` aligned as milestones land; add CI lint once SpecFlow catches up.
