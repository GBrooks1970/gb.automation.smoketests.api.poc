# DEMOAPP003 - TypeScript / Express / Playwright BDD

**Version 2 - [06/11/25]**

The `_API_TESTING_GHERKIN_/DEMOAPP003_TYPESCRIPT_PLAYWRIGHT` project hosts the TOKENPARSER API on `http://localhost:3001`. It mirrors the shared token parsing utilities, exposes Swagger, and is validated through Playwright + Cucumber scenarios implemented with the Screenplay pattern.

---

## Token Parser API Endpoints

1. **GET `/alive`**
   - Purpose: Lightweight health probe.
   - Success (200): `{ "Status": "ALIVE-AND-KICKING" }`

2. **GET `/parse-dynamic-string-token`**
   - Query: `token` (string, required) in the `[TYPE-LIST]-<LENGTH>[-LINES-<COUNT>]` format.
   - Success (200): `{ "ParsedToken": "<generated string>" }`
   - Error (400): `{ "Error": "TokenDynamicStringParser : Invalid string token format : <token>" }`

3. **GET `/parse-date-token`**
   - Query: `token` (string, required) describing anchor dates and adjustments.
   - Success (200): `{ "ParsedToken": "yyyy-MM-dd HH:mm:ssZ" }`
   - Error (400): `{ "Error": "TokenDateParser.parseDateStringToken : Invalid string token format : <token>" }`

---

## Swagger / OpenAPI

- Swagger UI: `http://localhost:3001/swagger/v1/json`
- Raw OpenAPI JSON: `http://localhost:3001/swagger/v1/swagger.json`
- Raw OpenAPI YAML: `http://localhost:3001/swagger/v1/swagger.yaml`

`.batch/RUN_DEMOAPP003_TYPESCRIPT_PLAYWRIGHT_API_AND_TESTS.BAT` opens the Swagger UI automatically once the host is ready.

---

## Stack Highlights

- **Runtime**: Node.js + TypeScript (ES2022 target) served via Express.
- **Testing**: Playwright APIRequest fixtures orchestrated with `@cucumber/cucumber`; Screenplay pattern models actors, abilities, tasks, and questions.
- **Configuration**: `.env.example` documents default values including `API_BASE_URL=http://localhost:3001` and `TOKENPARSER_LOG_LEVEL` for verbosity control.
- **Logging**: Shared logger (`src/services/logger.ts`) gates output by level; defaults to `debug` but can be set to `silent`, `error`, `warn`, or `info`.
- **Documentation**: `docs/ARCHITECTURE.md`, `docs/QA_STRATEGY.md`, and `docs/SCREENPLAY_GUIDE.md` cover design, risk strategy, and Screenplay conventions.

---

## Project Layout

```
_API_TESTING_GHERKIN_/DEMOAPP003_TYPESCRIPT_PLAYWRIGHT/
- src/
  - server.ts (Express host + Swagger)
  - config.ts (centralised configuration)
  - services/logger.ts (log abstraction)
  - tokenparser/ (TokenDateParser and TokenDynamicStringParser)
- features/
  - api/ (REST BDD features)
  - util-tests/ (direct parser coverage)
  - step_definitions/ (Screenplay-driven steps)
- screenplay/ (Actor, Ability, Task, Question helpers)
- tooling/ (cucumber.cjs, playwright.config.ts, cucumber-summary.cjs)
- docs/ (architecture, QA, Screenplay guides)
- .env.example (environment configuration template)
- package.json / tsconfig.json / npm scripts
```

---

## Scripts and Automation

- `npm start` - launches the Express API on port `3001`.
- `npm test` / `npm run test:bdd` - executes Cucumber features with Playwright fixtures.
- `npm run verify` - type checks then runs the BDD suite.
- `.batch/RUN_DEMOAPP003_TYPESCRIPT_PLAYWRIGHT_API_AND_TESTS.BAT` - starts the API, waits for readiness, opens Swagger, runs the BDD suite, appends a scenario summary, and stops the host. Results are written to `.results/demoapp003_typescript_playwright_<UTC_TIMESTAMP>.txt` with a Cucumber JSON report stored at `.results/playwright_cucumber_report.json`.

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

- Playwright APIRequestContext powers HTTP interactions; no browser session is required.
- Screenplay memory stores responses for flexible assertions (`ResponseStatus`, `ResponseJson`).
- Utility feature files mirror DEMOAPP001 coverage to ensure parser parity across stacks.
- Batch runs capture deterministic timestamps in UTC to avoid timezone drift.

---

## References

- Main README: `README.md`
- Cypress stack: `API Testing POC/typescript_cucumber_cypress.md`
- C# stack: `API Testing POC/csharp_specflow_playwright.md`
- Token contract: `API Testing POC/tokenparser_api_contract.md`

---

## Screenplay Mapping & Parity Plan

### DEMOAPP003 (TypeScript + Playwright) Mapping
- **Actors** – `screenplay/actors/Actor.ts` instantiated via `screenplay/support/custom-world.ts`. Each scenario’s world provides a dedicated actor.
- **Abilities** – `CallAnApi` wraps Playwright’s `APIRequestContext`; `UseTokenParsers` exposes direct util access.
- **Tasks** – `screenplay/tasks/SendGetRequest.ts` encapsulates GET calls; more tasks can be added for POST/PUT.
- **Questions** – `screenplay/questions/ResponseStatus.ts` / `ResponseJson.ts` expose response assertions.
- **Memory** – Actor’s `remember`/`answer` stores the latest API response.

### Parity Plan

| Layer | DEMOAPP003 (TS+PW) | DEMOAPP001 (TS+Cypress) | DEMOAPP002 (C#+SpecFlow) | Planned Actions |
| --- | --- | --- | --- | --- |
| Actor setup | Custom Cucumber world instantiates `Actor` + abilities | Screenplay helpers exist in `src/screenplay/**` but step defs still use raw helpers | No Screenplay abstraction | Create a Cypress “world” helper that instantiates an Actor per scenario and injects abilities; plan equivalent `ScreenplayContext` for SpecFlow. |
| Abilities | `CallAnApi`, `UseTokenParsers` | Steps call `cy.request` or import `CommonUtils` | `RequestHelper`/`HttpClient` used directly | Rework Cypress steps to call `actor.attemptsTo(...)`. In SpecFlow, wrap HttpClient + parsers as abilities so steps stay declarative. |
| Tasks | `SendGetRequest` | None (imperative requests) | `RequestHelper.GetAsync...` methods | Port `SendGetRequest` to Cypress (using `cy.task` or `cy.request` internally). Introduce C# task classes (e.g., `SendGetRequestTask`) consumed by steps. |
| Questions | `ResponseStatus`, `ResponseJson` | Assertions inspect local variables | Steps parse JSON via `JsonDocument` | Expose question helpers for Cypress and SpecFlow so assertions use the same semantics (status/question). |
| Notes/Memory | Actor stores responses by key | Globals/module scope store last response | `_response` fields per step class | Adopt a shared “Memory” helper for Cypress and create a SpecFlow `ScenarioContext` extension to mimic Actor memory. |

### Milestones
1. **Cypress** – Introduce a wrapper around `cy.session`/`cy.log` that instantiates Actors; update API step definitions to use Screenplay tasks & questions.
2. **SpecFlow** – Add `ScreenplayContext` service registered via `ScenarioDependencies`. Gradually migrate step classes to call tasks/questions instead of raw helpers.
3. **Documentation** – Mirror this section (mapping + parity table) in `API Testing POC/typescript_cucumber_cypress.md` and `API Testing POC/csharp_specflow_playwright.md` with implementation progress indicators.
4. **CI Enforcement** – Add lint/check scripts that scan step definitions for direct `cy.request`/`RequestHelper` usage and warn when Screenplay abstractions are bypassed.
