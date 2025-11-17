# DEMOAPP003 - TypeScript / Express / Playwright BDD

**Version 6 - [17/11/25]**

`_API_TESTING_GHERKIN_/DEMOAPP003_TYPESCRIPT_PLAYWRIGHT` mirrors DEMOAPP001 but exercises the Token Parser API via Playwright request contexts and `@cucumber/cucumber`. The API listens on `http://localhost:3001` and ships the same parser utilities, Swagger docs, and Screenplay helpers as the Cypress stack.

---

## Contract Summary

Endpoints match the shared spec (`/alive`, `/parse-dynamic-string-token`, `/parse-date-token`). Swagger is available at `http://localhost:3001/swagger/v1/json`, `/swagger/v1/swagger.json`, and `/swagger/v1/swagger.yaml`.

---

## Layout

```
_API_TESTING_GHERKIN_/DEMOAPP003_TYPESCRIPT_PLAYWRIGHT/
  docs/             Architecture, QA, Screenplay guides
  src/              Express host + parser implementations (port 3001)
  screenplay/       Actor, ability, task, question helpers
  features/         API + util Feature files and step definitions
  tooling/          Cucumber config, Playwright config, summary scripts
  .results/         Logs + cucumber JSON consumed by automation
```

---

## Quick Start

```powershell
cd _API_TESTING_GHERKIN_/DEMOAPP003_TYPESCRIPT_PLAYWRIGHT
npm install
npm run pw:install
npm run start
npm run test:bdd
```

`npm run dev` enables hot reload. `npm run lint`, `npm run format`, and `npm run ts:check` enforce code quality; `npm run verify` chains type-check + BDD tests. Util-only execution: `npm run test:bdd -- --tags @UTILTEST`.

---

## Automation

| Script | Description |
| --- | --- |
| `.batch/RUN_DEMOAPP003_TYPESCRIPT_PLAYWRIGHT_API_AND_TESTS.BAT` | Loads `.env`, starts the API on port 3001 if free, opens Swagger, runs util specs (`@UTILTEST`), runs the full suite, and stops the API. Logs live in `.results/demoapp003_typescript_playwright_<UTC>.txt`. |
| `.batch/RUN_ALL_API_AND_TESTS.BAT` | Executes this runner after DEMOAPP001, writing summary metrics for util + API suites. |
| `.batch/RUN_ALL_APIS_AND_SWAGGER.BAT` | Starts the TypeScript and .NET APIs, opens Swagger, and tears them down when done. |

`tooling/run-cucumber-with-summary.cjs` wraps cucumber execution, then invokes `tooling/cucumber-summary.cjs` so the orchestrator can parse counts and durations.

---

## Screenplay Snapshot

- World: `screenplay/core/custom-world.ts` creates `Actor.named("Playwright API Tester")`, attaches `UseTokenParsers`, and enables `CallAnApi` when scenarios begin.
- Abilities: `CallAnApi` wraps Playwright `APIRequestContext`; `UseTokenParsers` exposes parser helpers.
- Tasks: `SendGetRequest` performs HTTP calls; util steps reuse ability methods.
- Questions: `ResponseStatus`, `ResponseBody`, and util helpers store intermediate data in actor memory keys that match the Cypress and SpecFlow stacks.

Refer to `API Testing POC/DEMO_DOCS/screenplay_parity_demoapps.md` for the cross-stack matrix.

---

## Testing Notes

- Playwright runs purely in API-request mode; no UI/browser context is required.
- Feature tables are copied from DEMOAPP001 to guarantee identical coverage (55 passing scenarios per run as of 2025-11-17).
- Logs include UTC timestamps and cucumber JSON; the orchestrator consumes both when building reporting artefacts.

---

## References

- Main README
- `_API_TESTING_GHERKIN_/DEMOAPP003_TYPESCRIPT_PLAYWRIGHT/docs`
- Companion docs: `typescript_cucumber_cypress.md`, `csharp_specflow_playwright.md`, `python_playwright.md`
- Contract + automation specs: `tokenparser_api_contract.md`, `batch_runner_design.md`
