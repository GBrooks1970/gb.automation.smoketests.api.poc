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
