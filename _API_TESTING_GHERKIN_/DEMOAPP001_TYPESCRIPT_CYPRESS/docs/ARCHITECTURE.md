# DEMOAPP001 Cypress Architecture Blueprint

**Version 1 - [12/11/25]**

## Stack Snapshot
- **Runtime**: Node.js 20 + TypeScript executed through Cypress 13 with the Badeball Cucumber preprocessor.
- **Pattern**: Screenplay (Actors, Abilities, Tasks, Questions, Memory) shared with DEMOAPP003 for feature parity; Screenplay code now sits at the project root (`/screenplay`) rather than `src/`.
- **API Host**: Express Token Parser service housed in `src/` and launched locally via npm or `.batch` scripts.
- **Framework Alignment**: Uses the same lint/format rules, parsers, and domain modules as the Playwright stack to enable copy-pasteable features.

## Folder Layout (key paths)
```
_API_TESTING_GHERKIN_/DEMOAPP001_TYPESCRIPT_CYPRESS
|--- docs/                     <- this document set
|--- cypress/
|    |--- integration/         <- feature files (API + util tests)
|    |--- support/
|         |--- step_definitions/
|         |--- screenplay/     <- Cypress-specific glue (worlds leverage root Screenplay)
|--- screenplay/               <- shared Screenplay implementation (outside src)
|--- src/                      <- Express host + token parser services
|--- .eslintrc.cjs / .prettierrc.json
|--- cypress.config.ts
|--- package.json / package-lock.json
|--- tsconfig.json             <- path aliases for src + screenplay imports
`--- .env / .env.example
```

## Tooling & Automation
- **npm scripts**:
  - `npm run start|dev` serve the API.
  - `npm run ts:check` validates Screenplay + Cypress TypeScript.
  - `npm run lint` / `npm run lint:fix` enforce ESLint (scoped to `src`, `screenplay`, `cypress` per parity requirement).
  - `npm run format` / `npm run format:fix` run Prettier with the same scope as lint.
  - `npm run test:bdd` executes Cypress in headless mode; `npm run cy:test` opens the GUI runner.
  - `npm run verify` = type-check + Cypress run (CI default).
- **Batch integration**:
  - `.batch/RUN_DEMOAPP001_TYPESCRIPT_CYPRESS_API_AND_TESTS.BAT` sources `.env` via `env_utils.bat`, starts the API, runs `npm run verify -- --env grepTags=...` (if provided), and captures `.results` logs.
  - `.batch/RUN_ALL_APIS_AND_SWAGGER.BAT` starts the three demo APIs for parity checks; recent fixes ensure the TypeScript servers also shut down cleanly.
- **Linters/Formatters**: Matching configuration to Playwright ensures both stacks stay in lockstep; warnings are tracked but tolerated until Cypress plugin upgrades land.

## Screenplay Layers
- **Actors**: `screenplay/actors/Actor.ts` retains synchronous Cypress command chaining while exposing the same API as the async Playwright actor.
- **Abilities**: `screenplay/abilities/CallAnApi.ts` wraps `cy.request`; `UseTokenParsers` surfaces parser utilities from `src/tokenparser`. Ability registration happens inside `screenplay/core/api-world.ts` and `screenplay/core/util-world.ts`.
- **Tasks/Questions**: Shared modules under `screenplay/tasks` and `screenplay/questions` write to `screenplay/support/memory-keys.ts`.
- **Worlds**: 
  - `screenplay/core/api-world.ts` provisions `"Cypress API Actor"` for feature tags that target live endpoints.
  - `screenplay/core/util-world.ts` provisions `"Cypress Util Actor"` for `@UTILTEST` scenarios to reduce noise between parser-only runs.
  - Step definitions in `cypress/support/step_definitions/**` import helper factories (`apiActor()` / `utilActor()`) rather than instantiating actors manually.

## Configuration & Fixtures
- **Environment Variables**: `.env` / `.env.example` contain base URLs and port numbers consumed by both API server and Cypress tests. Batch scripts load them through `.batch/env_utils.bat` to keep Windows terminals consistent.
- **tsconfig / paths**: The custom `tsconfig.json` adds path aliases so step definitions can import `screenplay/*` without brittle relative paths.
- **Cypress Config**: `cypress.config.ts` glues the Cucumber preprocessor, defines env tags (e.g., `grepTags`), and points integration folders to `cypress/integration`.

## Quality Gates
1. `npm run lint`
2. `npm run format`
3. `npm run ts:check`
4. `npm run test:bdd` (default reporter writes to `.results/demoapp001_typescript_cypress_*.txt`)
5. `.batch/RUN_DEMOAPP001_TYPESCRIPT_CYPRESS_API_AND_TESTS.BAT` for a single-command smoke (used before parity pushes).

## Known Constraints
- Cypress `postinstall` runs `npx cypress verify`, which currently fails in some CI agents. Install dependencies with `npm install --ignore-scripts` when necessary, then run `npx cypress verify` manually on developer machines.
- Screenplay folders sit outside `src/`; ensure IDE path mappings or absolute imports reflect the move.

## References
- Playwright counterpart docs: `_API_TESTING_GHERKIN_/DEMOAPP003_TYPESCRIPT_PLAYWRIGHT/docs`.
- Screenplay parity overview: `API Testing POC/screenplay_parity_typescript.md`.
- Batch helpers: `.batch/env_utils.bat`, `.batch/RUN_ALL_APIS_AND_SWAGGER.BAT`, `.batch/RUN_DEMOAPP001_TYPESCRIPT_CYPRESS_API_AND_TESTS.BAT`.
