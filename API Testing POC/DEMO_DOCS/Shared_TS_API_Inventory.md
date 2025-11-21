# Shared TypeScript API Inventory (21/11/25)

## Shared Package Contents
- Location: `packages/tokenparser-api-shared/src`.
- Key modules:
  - `server.ts` – Express host factory exposing `createTokenParserApp` / `startTokenParserServer`.
  - `config.ts` – shared logging/env config.
  - `services/` – `logger`, `common-utils`, `symbol-consts`.
  - `tokenparser/` – `TokenDateParser`, `TokenDynamicStringParser`.
  - `utils/date-utils.ts`.
- Entry point: `src/index.ts` re-exports app factory + parser utilities.

## Dependencies
- Express + body-parser + Swagger (`swagger-jsdoc`, `swagger-ui-express`).
- `date-fns`, `js-yaml`.
- Tooling: `typescript`, `tsx`, `ts-node`.

## Batch Scripts Touchpoints
- `.batch/RUN_DEMOAPP001_TYPESCRIPT_CYPRESS_API_AND_TESTS.BAT`.
- `.batch/RUN_DEMOAPP003_TYPESCRIPT_PLAYWRIGHT_API_AND_TESTS.BAT`.
- `.batch/env_utils.bat` (loads `.env` for ports/base URLs).

## Workspace Status
- Root `package.json` workspaces:
  - `packages/tokenparser-api-shared`
  - `_API_TESTING_GHERKIN_/DEMOAPP001_TYPESCRIPT_CYPRESS`
  - `_API_TESTING_GHERKIN_/DEMOAPP003_TYPESCRIPT_PLAYWRIGHT`
- Shared package builds via `npm run workspace:build`.

## Consumers
- DEMOAPP001 + DEMOAPP003 run `npm run start`, which launches `node packages/tokenparser-api-shared/dist/cli/start.js` on ports 3000/3001; no local `src` host exists anymore.
- Screenplay abilities, Cypress steps, and Playwright step definitions import parser helpers directly from `tokenparser-api-shared`.
- `tsconfig.json` files focus on `cypress/`, `screenplay/`, `features/`, and tooling folders; parser/import paths now resolve through the shared package.

## Next Steps
- Keep `Backlog_Parity` updated when further shared API refactors occur (features, logging, metrics, etc.).
- Confirm orchestrator runs (e.g., `.batch/RUN_ALL_API_AND_TESTS.BAT`) remain green now that both demos rely on the shared CLI.
