# DEMOAPP003 – Playwright BDD Architecture Guide

**Version 2 – 18/11/25**

## 1. Overview
- **API Host**: Shared Express + TypeScript workspace (`packages/tokenparser-api-shared/src/server.ts`) identical to DEMOAPP001 but listening on port 3001 by default when launched from this app's scripts.
- **Automation Stack**: Playwright + Cucumber (cucumber-js) with Screenplay abstractions (`@serenity-js` style) reusing the same modules as the Cypress stack.
- **Objective**: Demonstrate parity between Cypress and Playwright implementations while exercising the same parser logic and feature tables.

## 2. Components
| Component | Location | Notes |
| --- | --- | --- |
| Express API | `packages/tokenparser-api-shared/` | Shared logging, Swagger, parser modules referenced via `@demoapps/tokenparser-api-shared`. |
| Feature files | `features/` | BDD scenarios for util (`@UTILTEST`) and API flows. |
| Screenplay | `screenplay/` | Shared with DEMOAPP001 via workspace linking; Playwright-specific glue under `screenplay/core`. |
| Tooling | `tooling/` | Playwright config, custom summary renderer, CLI wrappers for cucumber-js. |

## 3. Runtime Flow
1. `.batch/RUN_DEMOAPP003_TYPESCRIPT_PLAYWRIGHT_API_AND_TESTS.BAT` loads env vars, probes port 3001, and starts `npm run start` if required.
2. Util suite executes via `npm run test:bdd -- --tags @UTILTEST` before main API suite (`npm run test:bdd`).
3. Screenplay actors (instantiated in `screenplay/core/custom-world.ts`) use Playwright's `APIRequestContext` for HTTP calls and shared parser helpers for util scenarios.
4. Logs route to `.results/demoapp003_typescript_playwright_*.txt`. The orchestrator aggregates them under the `Playwright TS` label.

## 4. Directory Snapshot
```
DEMOAPP003_TYPESCRIPT_PLAYWRIGHT
├─ docs/
├─ features/
│  ├─ api/
│  └─ util/
├─ screenplay/
│  ├─ abilities/
│  ├─ tasks/
│  ├─ questions/
│  └─ core/custom-world.ts
├─ (shared) ../../packages/tokenparser-api-shared/ (Express API + token parser)
├─ tooling/ (run_bdd script, summary renderer)
├─ package.json
├─ cucumber.mjs / playwright.config.ts
└─ .results/
```

## 5. Automation Hooks
- `npm run start`: shared API host (set `PORT=3001` before running locally).
- `npm run test:bdd`: `NODE_OPTIONS=--loader ts-node/esm cucumber-js` harness executing features.
- `npm run lint`, `npm run format`, `npm run ts:check`: align with DEMOAPP001 for parity.
- `tooling/run_bdd.ts`: CLI entry point used by `.batch/RUN_DEMOAPP003_TYPESCRIPT_PLAYWRIGHT_API_AND_TESTS.BAT` to ensure consistent reporters and `.results` output.
- `.batch/RUN_ALL_APIS_AND_SWAGGER.BAT`: includes this API when launching documentation portals.

## 6. Operational Considerations
- Keep `screenplay/**` fully aligned with DEMOAPP001; share modules where possible via npm workspaces or path aliases.
- `.env` files must define `API_BASE_URL=http://localhost:3001`; batch scripts set this automatically.
- Summary renderer writes Markdown/ASCII summaries consumed by docs; update it when log formats change.
- Track changes in `API Testing POC/DEMO_DOCS/screenplay_parity_demoapps.md` and `tokenparser_api_contract.md`.
