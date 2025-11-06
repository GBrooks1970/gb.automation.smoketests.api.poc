# DEMOAPP001 - TypeScript / Express / Cypress

**Version 2 - [06/11/25]**

The `_API_TESTING_GHERKIN_/DEMOAPP001_TYPESCRIPT_CYPRESS` project hosts the TOKENPARSER API on `http://localhost:3000`. Swagger UI is enabled and the service is validated with Cypress + Cucumber BDD tests running against the shared token parsing utilities.

---

## Token Parser API Endpoints

1. **GET `/alive`**
   - Purpose: Lightweight health probe.
   - Success (200): `{ "Status": "ALIVE-AND-KICKING" }`

2. **GET `/parse-dynamic-string-token`**
   - Query: `token` (string, required) in the `[TYPE-LIST]-LEN-<length>[-LINES-<count>]` format.
   - Success (200): `{ "ParsedToken": "<generated string>" }`
   - Error (400): `{ "Error": "TokenDynamicStringParser : Invalid string token format : <token>" }`

3. **GET `/parse-date-token`**
   - Query: `token` (string, required) describing anchor dates and adjustments.
   - Success (200): `{ "ParsedToken": "yyyy-MM-dd HH:mm:ssZ" }`
   - Error (400): `{ "Error": "TokenDateParser.parseDateStringToken : Invalid string token format : <token>" }`

---

## Swagger / OpenAPI

- Swagger UI: `http://localhost:3000/swagger/v1/json`
- Raw OpenAPI JSON: `http://localhost:3000/swagger/v1/swagger.json`
- Raw OpenAPI YAML: `http://localhost:3000/swagger/v1/swagger.yaml`

---

## Stack Highlights

- **Runtime**: Node.js + TypeScript served via Express with Swagger integration.
- **Testing**: Cypress 13 with the Badeball Cucumber preprocessor for Gherkin support.
- **Token Utilities**: Shared `TokenDateParser` and `TokenDynamicStringParser` modules consumed by the API and tests.
- **Automation**: `.batch/RUN_DEMOAPP001_TYPESCRIPT_CYPRESS_API_AND_TESTS.BAT` orchestrates start-up, Swagger launch, Cypress execution, and teardown.

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

- Feature files under `cypress/integration` mirror the REST contract and utility scenarios.
- Assertions use UTC-normalised timestamps to avoid timezone drift across environments.
- Batch runs include automatic Swagger launch for quick manual inspection.

---

## References

- Main README: `README.md`
- Playwright stack: `API Testing POC/typescript_playwright_cucumber.md`
- C# stack: `API Testing POC/csharp_specflow_playwright.md`
- Token contract: `API Testing POC/tokenparser_api_contract.md`
