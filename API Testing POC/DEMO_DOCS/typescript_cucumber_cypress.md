# DEMOAPP001 - TypeScript / Express / Cypress

**Version 6 - [17/11/25]**

`_API_TESTING_GHERKIN_/DEMOAPP001_TYPESCRIPT_CYPRESS` is the reference implementation for the Token Parser Express API and Cypress + Cucumber Screenplay tests. It exposes the shared endpoints on `http://localhost:3000`, logs contract traffic, and provides util + API suites that seed the other stacks.

---

## Contract Endpoints

| Path | Notes |
| --- | --- |
| `GET /alive` | Returns `{ "Status": "ALIVE-AND-KICKING" }` while the host is reachable. |
| `GET /parse-dynamic-string-token?token=...` | Generates strings from `[ALPHA|NUMERIC|...]` tokens. Success payload: `{ "ParsedToken": "<string>" }`. Errors return `{ "Error": "Invalid string token format" }`. |
| `GET /parse-date-token?token=...` | Resolves bracketed date tokens and normalises output to UTC `yyyy-MM-dd HH:mm:ssZ`. |

Swagger endpoints: `http://localhost:3000/swagger/v1/json`, `.../swagger/v1/swagger.json`, `.../swagger/v1/swagger.yaml`.

---

## Project Layout

```
_API_TESTING_GHERKIN_/DEMOAPP001_TYPESCRIPT_CYPRESS/
  docs/             Architecture, QA strategy, Screenplay guides
  src/              Express host + parser implementations
  screenplay/       Actor, ability, task, question, world helpers
  cypress/          Feature files + step definitions (@API + @UTILTEST)
  .batch/           Local automation helpers
  .results/         Timestamped run outputs consumed by the orchestrator
```

---

## Quick Start

```powershell
cd _API_TESTING_GHERKIN_/DEMOAPP001_TYPESCRIPT_CYPRESS
npm install
npm run start
npx cypress run
```

Quality gates: `npm run lint`, `npm run format`, `npm run ts:check`. `npm run test:bdd` executes the suite headlessly; `npx cypress open` provides the interactive runner.

---

## Automation Scripts

| Script | Description |
| --- | --- |
| `.batch/RUN_DEMOAPP001_TYPESCRIPT_CYPRESS_API_AND_TESTS.BAT` | Loads `.env`, checks port 3000, starts the API if free, opens Swagger, runs util specs first, then runs the full suite. Stops the API it launched and writes logs to `.results/demoapp001_typescript_cypress_<UTC>.txt`. |
| `.batch/RUN_ALL_API_AND_TESTS.BAT` | Orchestrates every DEMOAPP, capturing this stack's exit code and log path inside `run_metrics_<UTC>.{metrics,txt,md}`. |
| `.batch/RUN_ALL_APIS_AND_SWAGGER.BAT` | Starts the TypeScript and .NET APIs for exploratory testing; terminates them when the session ends. |

All runners call `env_utils.bat` to hydrate ports and base URLs.

---

## Testing Notes

- Util scenarios are tagged `@UTILTEST` so automation can fail fast before API tests.
- API steps answer Screenplay questions (`ResponseStatus`, `ResponseBody`) while util helpers read from `UtilActorMemory` for deterministic UTC comparisons.
- Feature tables (seven date rows, six dynamic rows, range coverage) are treated as the canonical dataset across stacks.
- Logs include UTC timestamps (`yyyyMMddTHHmmZ`) to simplify cross-suite correlation inside the metrics renderer.

---

## Screenplay Summary

| Layer | Details |
| --- | --- |
| Actors / Worlds | `screenplay/core/api-world.ts` and `screenplay/core/util-world.ts` create per-scenario actors. |
| Abilities | `CallAnApi` wraps `cy.request`; `UseTokenParsers` exposes the local parser modules. |
| Tasks | `SendGetRequest` issues HTTP calls; util steps call ability helpers rather than importing parsers directly. |
| Questions | `ResponseStatus`, `ResponseBody`, and util memory helpers capture assertions. |
| Memory Keys | `screenplay/support/memory-keys.ts` stays aligned with Playwright, SpecFlow, and Python stacks. |

Parity guidance lives in `API Testing POC/DEMO_DOCS/screenplay_parity_demoapps.md`. Update this doc and the parity matrix in lock-step.

---

## Configuration & Logging

- `TOKENPARSER_LOG_LEVEL` controls Express/parser verbosity (`silent`, `error`, `warn`, `info`, `debug`).
- `.env.example` documents the default `PORT` and `API_BASE_URL`. Batch scripts call `env_utils.bat load_env_vars` so Screenplay abilities always use the correct host.

---

## References

- Main README
- `_API_TESTING_GHERKIN_/DEMOAPP001_TYPESCRIPT_CYPRESS/docs`
- Companion stacks: `typescript_cucumber_playwright.md`, `csharp_specflow_playwright.md`, `python_playwright.md`
- Contract + automation specs: `tokenparser_api_contract.md`, `batch_runner_design.md`
