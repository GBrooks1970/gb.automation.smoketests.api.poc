# DEMOAPP003 Playwright Architecture Blueprint

**Version 2 - [12/11/25]**

## Stack Snapshot
- **Runtime**: Node.js 20 + TypeScript (ES2022) executed via `@cucumber/cucumber` with Playwright `APIRequestContext` fixtures.
- **Primary Pattern**: Screenplay (Actors, Abilities, Tasks, Questions, Memory notes) to keep BDD steps declarative and parity-aligned with the Cypress stack.
- **API Host**: Local Express Token Parser (`src/server.ts`) reused across stacks; started automatically by `.batch` harnesses.
- **Toolchain**: `tsx` for API entrypoints, `ts-node` for step execution, ESLint + Prettier covering `src/`, `screenplay/`, and `features/`, and npm scripts mirrored across TypeScript projects.

## Folder Layout (authoritative)
```
_API_TESTING_GHERKIN_/DEMOAPP003_TYPESCRIPT_PLAYWRIGHT
|--- docs/
|    |--- ARCHITECTURE.md
|    |--- QA_STRATEGY.md
|    `--- SCREENPLAY_GUIDE.md
|--- features/
|    |--- api/...
|    `--- util-tests/...
|--- screenplay/               <- Screenplay implementation (outside src for parity)
|--- src/                      <- Express host + domain parsers
|--- tooling/
|    |--- run-cucumber-with-summary.cjs
|    `--- playwright.config.ts
|--- .eslintrc.cjs / .prettierrc.json
|--- package.json / package-lock.json
|--- tsconfig.json             <- path aliases shared with Cypress stack
`--- .env / .env.example
```

## Tooling & Automation
- **npm scripts**:
  - `npm run start|dev` host the API.
  - `npm run ts:check` validates types for both Screenplay and step layers.
  - `npm run lint` / `npm run lint:fix` enforce ESLint rules (tests + types focus per parity requirements).
  - `npm run format` / `format:fix` gate Prettier conformance.
  - `npm run test:bdd` executes Cucumber via `tooling/run-cucumber-with-summary.cjs`.
  - `npm run verify` aggregates type-check + BDD run for CI.
  - `npm run pw:test` reserved for future browser/UI specs.
- **Batch integration**:
  - `.batch/RUN_DEMOAPP003_TYPESCRIPT_PLAYWRIGHT_API_AND_TESTS.BAT` spins up the API (through `env_utils.bat`), runs `npm run verify`, and captures logs under `.results/`.
  - `.batch/RUN_ALL_APIS_AND_SWAGGER.BAT` orchestrates the three demo APIs for cross-stack verification; log noise fixed via recent env utility patch.
- **Linters/Formatters**: Configured to initially scope tests + Screenplay code, matching the constraint documented in Screenplay parity notes.

## Screenplay Layers
- **Actors**: `screenplay/actors/Actor.ts` defines async `Actor` with `remember/recall`.
- **Abilities**: `CallAnApi` wraps Playwright `APIRequestContext` (auto-disposed in `After` hooks); `UseTokenParsers` exposes shared parsers. Both align 1:1 with the Cypress versions.
- **Tasks/Questions**: Located under `screenplay/tasks` and `screenplay/questions`, reusing shared memory keys via `screenplay/support/memory-keys.ts`.
- **Worlds**: `screenplay/core/custom-world.ts` wires a `CustomWorld` per scenario; hooks live in `features/step_definitions/world.ts` to attach abilities before tests.

## Configuration & Fixtures
- **Environment Variables**: Managed through `.env`/`.env.example`, surfaced via `env_utils.bat`. Key vars: `API_BASE_URL`, `PORT`, `CUCUMBER_TIMEOUT`.
- **Shared Domain Code**: `src/tokenparser` and `src/services/symbol-consts.ts` originate from the Cypress stack and importable via tsconfig path aliases.
- **Results**: Playwright HTML output stored in `.results/playwright_cucumber_report.json` plus Playwright report folder when UI specs run.

## Quality Gates
1. **Static**: `npm run lint` + `npm run format` run locally and in CI (warnings tolerated temporarily but tracked).
2. **Types**: `npm run ts:check`.
3. **Behavioural**: `npm run test:bdd` (API + util tags). Utilises Screenplay tasks for deterministic assertions.
4. **Batch Harness**: `.batch/RUN_DEMOAPP003_TYPESCRIPT_PLAYWRIGHT_API_AND_TESTS.BAT` for one-click smoke; `.batch/RUN_ALL_APIS_AND_SWAGGER.BAT` validates all servers start/stop cleanly.

## References
- Screenplay parity overview: `API Testing POC/screenplay_parity_typescript.md`.
- Cypress counterpart docs: `_API_TESTING_GHERKIN_/DEMOAPP001_TYPESCRIPT_CYPRESS/docs`.
- Automation tooling: `.batch/env_utils.bat`, `.batch/RUN_*`.

