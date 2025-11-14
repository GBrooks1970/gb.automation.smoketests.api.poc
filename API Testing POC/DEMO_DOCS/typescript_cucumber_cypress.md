# DEMOAPP001 - TypeScript / Express / Cypress

**Version 5 - [14/11/25]**

The `_API_TESTING_GHERKIN_/DEMOAPP001_TYPESCRIPT_CYPRESS` project hosts the Token Parser API on `http://localhost:3000`. Swagger UI is enabled and the service is validated with Cypress + Cucumber BDD tests powered by the Screenplay pattern. Screenplay source now lives at `_API_TESTING_GHERKIN_/DEMOAPP001_TYPESCRIPT_CYPRESS/screenplay` (outside `src/`) to match the Playwright stack.

---

## Token Parser API Endpoints

1. **GET `/alive`**
   - Purpose: Lightweight health probe.
   - Success (200): `{ "Status": "ALIVE-AND-KICKING" }`

2. **GET `/parse-dynamic-string-token`**
   - Query: `token` (string, required) in the `[TYPE-LIST]-LEN-<length>[-LINES-<count>]` format.
   - Success (200): `{ "ParsedToken": "<generated string>" }`
   - Error (400): `{ "Error": "Invalid string token format" }`

3. **GET `/parse-date-token`**
   - Query: `token` (string, required) describing anchor dates and adjustments.
   - Success (200): `{ "ParsedToken": "yyyy-MM-dd HH:mm:ssZ" }`
   - Error (400): `{ "Error": "Invalid string token format" }`

---

## Swagger / OpenAPI

- Swagger UI: `http://localhost:3000/swagger/v1/json`
- Raw OpenAPI JSON: `http://localhost:3000/swagger/v1/swagger.json`
- Raw OpenAPI YAML: `http://localhost:3000/swagger/v1/swagger.yaml`

---

## Stack Highlights

- **Runtime**: Node.js + TypeScript served via Express with Swagger and shared parser modules.
- **Testing**: Cypress 13 with the Badeball Cucumber preprocessor; API and util suites continue to share the seven-row Scenario Outlines used by the Playwright stack.
- **Screenplay**: Actors, abilities, tasks, questions, and memory helpers mirror DEMOAPP003. Both `api-world.ts` and `util-world.ts` now bootstrap actors per scenario after moving Screenplay code out of `src/`.
- **Tooling**: ESLint + Prettier scope `src/`, `screenplay/`, and `cypress/**`. Run `npm run lint`, `npm run format`, and `npm run ts:check` before `npm run test:bdd` or `npm run verify`.
- **Automation**: `.batch/RUN_DEMOAPP001_TYPESCRIPT_CYPRESS_API_AND_TESTS.BAT` (and `.batch/RUN_ALL_APIS_AND_SWAGGER.BAT`) use `env_utils.bat` to hydrate `.env`, open Swagger, and stop the API and tests cleanly. The script now logs to `.results/demoapp001_typescript_cypress_<UTC_TIMESTAMP>.txt`.
- **Orchestrator Support**: `.batch/RUN_ALL_API_AND_TESTS.BAT` invokes this runner as part of the combined smoke test, pushes log metadata into `run_metrics_<UTC>.{metrics,txt,md}`, and publishes per-suite stats outlined in `API Testing POC/DEMO_DOCS/batch_runner_design.md`.
- **Install Note**: `npx cypress verify` still fails during `postinstall` on certain agents; install with `npm install --ignore-scripts` and run `npx cypress verify` manually when needed.
- **Documentation**: Project-level references live under `_API_TESTING_GHERKIN_/DEMOAPP001_TYPESCRIPT_CYPRESS/docs` (Architecture, QA Strategy, Screenplay Guide) and stay aligned with `API Testing POC/screenplay_parity_typescript.md`.

---

## Project Layout

```
_API_TESTING_GHERKIN_/DEMOAPP001_TYPESCRIPT_CYPRESS/
|--- docs/                       (Architecture, QA, Screenplay guides)
|--- screenplay/                 (Actors, abilities, tasks, questions, worlds)
|--- src/                        (Express host + parser services)
|--- cypress/
|     |--- integration/          (API + util feature files)
|     `--- support/step_definitions/
|--- .batch/                     (automation scripts)
|--- .results/                   (timestamped run outputs)
|--- package.json / tsconfig.json / cypress.config.ts
```

---

## Scripts and Automation

- `npm start` / `npm run dev` - launch the Express API on port `3000`.
- `npm run lint`, `npm run format`, `npm run ts:check` - enforce quality gates (matching DEMOAPP003).
- `npm run test:bdd` / `npm run verify` - execute Cypress BDD suites (verify runs type-check + tests).
- `.batch/RUN_DEMOAPP001_TYPESCRIPT_CYPRESS_API_AND_TESTS.BAT` - start API, open Swagger, run util + API suites, and teardown (logs land in `.results/`).
- `.batch/RUN_ALL_API_AND_TESTS.BAT` - orchestrate all demo stacks, produce metrics tables, and link back to this project's logs.
- `.batch/RUN_ALL_APIS_AND_SWAGGER.BAT` - start the three demo APIs together; now ensures TypeScript servers shut down when you exit.

---

## Logging Configuration

The stack currently relies on direct console output from Express and the token parsers. For quieter CI logs, redirect or filter stdout when invoking the batch script.

---

## Testing Notes

- Feature files under `cypress/integration` mirror the REST contract and util scenarios row-for-row with Playwright and SpecFlow (55 tests per run as of 2025‑11‑12).
- Assertions rely on UTC-normalised timestamps and Screenplay questions (`ResponseStatus`, `ResponseBody`, util memory helpers) to avoid timezone drift.
- Utility scenarios exercise parsers via the `UseTokenParsers` ability; Cypress no longer imports parser modules directly.
- Batch runs open Swagger automatically, capture deterministic timestamps, and leave artefacts under `.results/`.

---

## References

- Main README: `README.md`
- Project docs: `_API_TESTING_GHERKIN_/DEMOAPP001_TYPESCRIPT_CYPRESS/docs`
- Playwright stack: `API Testing POC/typescript_cucumber_playwright.md`
- C# stack: `API Testing POC/csharp_specflow_playwright.md`
- Token contract: `API Testing POC/tokenparser_api_contract.md`

---

## Screenplay Parity Status

| Layer | Status | Notes |
| --- | --- | --- |
| Actor/World setup | Complete | `api-world.ts` / `util-world.ts` provision actors per scenario with mirrored abilities. |
| Abilities | Complete | `CallAnApi` + `UseTokenParsers` attach automatically; util steps no longer import parser modules. |
| Tasks | Complete | `SendGetRequest` drives API calls; parser helpers live beside util steps until additional reuse emerges. |
| Questions | Complete | Assertions use `ResponseStatus`, `ResponseBody`, and util memory helpers. |
| Memory | Complete | `UtilActorMemory` stores responses/derived data instead of relying on module scope. |

**Ongoing Work**
1. Keep this doc, the Playwright doc, and `API Testing POC/screenplay_parity_typescript.md` synced whenever Screenplay helpers change.
2. Mirror this implementation into DEMOAPP002 once the SpecFlow Screenplay scaffolding (documented in `_API_TESTING_GHERKIN_/DEMOAPP002_CSHARP_PLAYWRIGHT/docs`) is ready.
