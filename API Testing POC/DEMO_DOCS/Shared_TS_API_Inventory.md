# Shared TypeScript API Inventory (18/11/25)

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
- DEMOAPP001 + DEMOAPP003 `src/server.ts` now proxy to `startTokenParserServer` with port overrides.
- Existing `src/tokenparser`/`src/services` modules inside each app re-export from the shared package to keep import paths stable.
- Cypress/Playwright util tests continue importing via local paths but receive shared implementations.

## Next Steps
- Replace re-export shims with direct imports in util tasks/steps once downstream changes stabilise.
- Update batch runners to call a shared start script when workspace build flow is automated.
