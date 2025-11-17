# DEMOAPP001 - TypeScript + Cypress + Screenplay

Token Parser Express API with Cypress Cucumber tests. This stack is the reference implementation for feature tables and Screenplay helpers used by the other demos.

---

## Project Layout

```
src/server.ts          # Express API host + Swagger endpoints
src/tokenparser/       # Date and dynamic string parser implementations shared with tests
cypress/               # Feature files, step definitions, Screenplay helpers
docs/                  # Architecture, QA strategy, Screenplay guide
.batch/                # Windows helpers (see repo root for orchestrator)
```

---

## Install and Setup

1. `cd _API_TESTING_GHERKIN_/DEMOAPP001_TYPESCRIPT_CYPRESS`
2. `npm install`

Environment variables live in `.env.example`. The automation scripts call `env_utils.bat load_env_vars` so `PORT` and `API_BASE_URL` stay in sync across stacks.

---

## Common Scripts

| Command | Description |
| --- | --- |
| `npm run start` | Launch the Express API on port `3000`. |
| `npm run dev` | Start the API with `tsx watch` for local debugging. |
| `npm run ts:check` | TypeScript compile in no-emit mode. |
| `npm run lint` / `npm run format` | Static analysis and formatting. |
| `npm run test:bdd` | Headless Cypress run (all specs). |
| `npx cypress open` | Interactive Cypress runner. |

Swagger endpoints:

- UI redirect: `http://localhost:3000/swagger/v1/json`
- JSON: `http://localhost:3000/swagger/v1/swagger.json`
- YAML: `http://localhost:3000/swagger/v1/swagger.yaml`

---

## Test Strategy

- **Util suites**: Feature files under `cypress/integration/util-tests/**` tagged with `@UTILTEST`. They exercise the parser classes without hitting the API.
- **API suites**: Feature files under `cypress/integration/API/**`. Steps call Screenplay tasks (`SendGetRequest`) so the API is validated end to end.
- **Batch automation**: `.batch/RUN_DEMOAPP001_TYPESCRIPT_CYPRESS_API_AND_TESTS.BAT` loads env vars, starts the API if the port is free, runs util specs first, then runs the full Cypress suite. Logs land in `.results/demoapp001_typescript_cypress_<UTC>.txt`.
- **Logging**: Set `TOKENPARSER_LOG_LEVEL` (silent, error, warn, info, debug) before starting the API or running tests to control parser telemetry volume.

---

## Running Everything With One Command

```bat
call .batch\RUN_DEMOAPP001_TYPESCRIPT_CYPRESS_API_AND_TESTS.BAT
```

The helper script:

1. Loads `.env` overrides (port/base URL).
2. Starts the API if the port is not already in use and opens Swagger.
3. Executes util specs (`cypress/integration/util-tests/**`).
4. Executes the full suite.
5. Stops the API it launched and echoes log locations.

---

## Documentation

- `docs/ARCHITECTURE.md` - detailed view of the Express host and parser modules.
- `docs/QA_STRATEGY.md` - test coverage, tagging, and reporting guidance.
- `docs/SCREENPLAY_GUIDE.md` - explains how the actor/ability/task model works within Cypress.
