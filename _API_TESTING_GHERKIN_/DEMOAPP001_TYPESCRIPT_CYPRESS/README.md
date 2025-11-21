# DEMOAPP001 - TypeScript + Cypress + Screenplay

Token Parser Express API with Cypress Cucumber tests. This stack is the reference implementation for feature tables and Screenplay helpers consumed by the other demos.

---

## Project Layout

```
cypress/               # Feature files, step definitions, Screenplay helpers
screenplay/             # Actors, abilities, tasks, and questions that pair with Cypress
docs/                  # Architecture, QA strategy, Screenplay guide
.batch/                # Windows helpers (see repo root for orchestrator)
types/                 # Cypress/Node ambient declarations
``` 

`tokenparser-api-shared` lives in `packages/` and provides the shared Express host, Swagger wiring, and parser utilities used by this stack.

---

## Install and Setup

1. `cd _API_TESTING_GHERKIN_/DEMOAPP001_TYPESCRIPT_CYPRESS`
2. `npm install`

Environment variables live in `.env.example`. `.batch/env_utils.bat` loads `.env.demoapp_ts_api` first so `PORT`, `API_BASE_URL`, and `TOKENPARSER_LOG_LEVEL` stay in sync across all TypeScript stacks.

---

## Common Scripts

| Command | Description |
| --- | --- |
| `npm run start` | Launches the shared Express host via `packages/tokenparser-api-shared/dist/cli/start.js` on port `3000`. |
| `npm run dev` | Alias of `npm run start` for consistency with the shared package CLI. |
| `npm run ts:check` | TypeScript compile in no-emit mode covering Cypress + Screenplay code. |
| `npm run lint` / `npm run format` | Static analysis and formatting for the Cypress + Screenplay sources. |
| `npm run test:bdd` | Headless Cypress run (all specs). |
| `npx cypress open` | Interactive Cypress runner; opens the `.cypress` GUI. |

---

## Shared Token Parser API

- **Contents**: `packages/tokenparser-api-shared` houses `server.ts`, `tokenparser/*`, `services/*`, `utils/date-utils.ts`, and the CLI entrypoint at `src/cli/start.ts`.
- **Build**: run `npm run shared:build` (root) or `npm run build` inside `packages/tokenparser-api-shared` to regenerate `dist/`.
- **Startup**: `npm run start` in this folder executes `node ../../packages/tokenparser-api-shared/dist/cli/start.js --port 3000 --label DEMOAPP001`.
- **Logging**: `TOKENPARSER_LOG_LEVEL` and `TOKENPARSER_LOGGER_CATEGORY` control the shared logger once the CLI is started; batch runners capture output to `.results/demoapp001_typescript_cypress_<UTC>.txt`.
- **Dependencies**: Cypress tests and Screenplay abilities import parser helpers directly from `tokenparser-api-shared`, so no local copy of `src/tokenparser` exists anymore.

When the API code changes, rebuild the shared package and rerun `npm run ts:check` plus `npm run test:bdd` here and inside DEMOAPP003 to keep artifacts aligned.

---

## Test Strategy

- **Util suites**: Feature files under `cypress/integration/util-tests/**` tagged with `@UTILTEST`. They exercise the parser classes via the `UseTokenParsers` ability and the shared package directly.
- **API suites**: Feature files under `cypress/integration/API/**` drive the HTTP endpoints hosted by the shared CLI bootstrap. Steps call Screenplay tasks (`SendGetRequest`) to keep requests consistent.
- **Batch automation**: `.batch/RUN_DEMOAPP001_TYPESCRIPT_CYPRESS_API_AND_TESTS.BAT` loads env vars, starts the shared API if needed, runs util specs, executes the full Cypress suite, and records logs in `.results/`.
- **Logging**: Shared `.env.demoapp_ts_api` toggles the log level for both TypeScript stacks; updating it affects DEMOAPP001/003 equally.

---

## Running Everything With One Command

```bat
call .batch\RUN_DEMOAPP001_TYPESCRIPT_CYPRESS_API_AND_TESTS.BAT
```

The helper script:

1. Loads `.env` overrides (port/base URL, logging).
2. Starts the shared API via `node packages/tokenparser-api-shared/dist/cli/start.js --port <PORT>` when the port is free.
3. Runs util specs before the full suite.
4. Stops the shared server it launched and echoes log locations.

---

## Documentation

- `docs/ARCHITECTURE.md` - explains how this stack consumes the shared Express host.
- `docs/QA_STRATEGY.md` - coverage goals for util and API scenarios that now rely on `tokenparser-api-shared`.
- `docs/SCREENPLAY_GUIDE.md` - actor, ability, and task guidance for Cypress and how they use the shared parsers.
