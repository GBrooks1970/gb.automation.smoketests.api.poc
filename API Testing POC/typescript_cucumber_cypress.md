# DEMOAPP001 - TypeScript / Express / Cypress

**Version 3 - [10/11/25]**

The `_API_TESTING_GHERKIN_/DEMOAPP001_TYPESCRIPT_CYPRESS` project hosts the TOKENPARSER API on `http://localhost:3000`. Swagger UI is enabled and the service is validated with Cypress + Cucumber BDD tests running against the shared token parsing utilities.

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

- **Runtime**: Node.js + TypeScript served via Express with Swagger integration.
- **Testing**: Cypress 13 with the Badeball Cucumber preprocessor; both API and util suites share identical seven-row Scenario Outlines.
- **Token Utilities**: Shared `TokenDateParser` and `TokenDynamicStringParser` modules consumed by the API and tests.
- **Screenplay**: API and util step definitions now share a single Actor equipped with `CallAnApi` and `UseTokenParsers`, mirroring the Playwright harness.
- **Automation**: `.batch/RUN_DEMOAPP001_TYPESCRIPT_CYPRESS_API_AND_TESTS.BAT` orchestrates start-up, Swagger launch, Cypress execution, and teardown while checking port usage with `env_utils.bat`.

---

## Project Layout

```
_API_TESTING_GHERKIN_/DEMOAPP001_TYPESCRIPT_CYPRESS/
- src/
  - server.ts (Express host + Swagger)
  - tokenparser/ (TokenDateParser and TokenDynamicStringParser)
- cypress/
  - integration/ (API and util feature files)
  - support/step_definitions/ (Cucumber step implementations)
  - support/commands.ts (shared Cypress helpers)
- .batch/ (automation scripts)
- .results/ (timestamped run outputs)
- package.json / tsconfig.json / cypress.config.ts
```

---

## Scripts and Automation

- `npm start` - launches the Express API on port `3000`.
- `npx cypress run` / `npm run test` - executes the Cypress BDD suite.
- `.batch/RUN_DEMOAPP001_TYPESCRIPT_CYPRESS_API_AND_TESTS.BAT` - runs the API + test workflow end to end and captures logs under `.results/demoapp001_typescript_cypress_<UTC_TIMESTAMP>.txt`.

---

## Logging Configuration

The stack currently relies on direct console output from Express and the token parsers. For quieter CI logs, redirect or filter stdout when invoking the batch script.

---

## Testing Notes

- Feature files under `cypress/integration` mirror the REST contract and util scenarios 1-for-1 with Playwright and SpecFlow (55 tests per run as of 2025-11-10).
- Assertions rely on UTC-normalised timestamps and Screenplay questions (`ResponseStatus`, `ResponseBody`, util memory helpers) to avoid timezone drift.
- Utility scenarios exercise the parsers through `UseTokenParsers`, so Cypress no longer imports parser modules directly.
- Batch runs open Swagger automatically, capture deterministic UTC timestamps, and leave artefacts under `.results/`.

---

## References

- Main README: `README.md`
- Playwright stack: `API Testing POC/typescript_cucumber_playwright.md`
- C# stack: `API Testing POC/csharp_specflow_playwright.md`
- Token contract: `API Testing POC/tokenparser_api_contract.md`

---

## Screenplay Parity Status

| Layer | Status | Notes |
| --- | --- | --- |
| Actor/World setup | Complete | `api-world.ts` and `util-world.ts` now provide the same Actor per scenario. |
| Abilities | Complete | `CallAnApi` + `UseTokenParsers` attach automatically; util steps no longer import parser modules. |
| Tasks | Complete | `SendGetRequest` drives API calls and parser interactions are modeled as Screenplay tasks. |
| Questions | Complete | Assertions use `ResponseStatus`, `ResponseBody`, and util memory helpers. |
| Memory | Complete | `UtilActorMemory` stores parsed tokens/errors instead of relying on module scope. |

**Ongoing Work**
- Keep this table (and the Playwright/SpecFlow docs) synchronised as new helpers land.
- Mirror the Cypress design back into DEMOAPP002 once Screenplay scaffolding for SpecFlow is ready.
