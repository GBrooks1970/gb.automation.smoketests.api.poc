# DEMOAPP003 Playwright Architecture Blueprint

## Stack Overview
- **Runtime**: Node.js + TypeScript targeting ES2022, driven by Playwright Test runner for low-level fixtures and Cucumber.js for BDD orchestration.
- **Testing Modes**:
  - BDD feature execution via `@cucumber/cucumber` sharing World state with Playwright APIRequest/Browser contexts.
  - Utility-level coverage executed through Cucumber steps leveraging domain parsers (`TokenDateParser`, `TokenDynamicStringParser`).
- **Pattern**: Screenplay abstraction provides Actors, Abilities, Tasks, Questions, and Shared Notes to keep declarative, business-focused step definitions.
- **API Host**: Token Parser Express server reused from DEMOAPP001 to provide identical endpoints for parity validation.

## Folder Layout
```
_DEMOAPP003_TYPESCRIPT_PLAYWRIGHT/
|--- docs/
|   |--- ARCHITECTURE.md
|   |--- QA_STRATEGY.md              <- risk-based/ISTQB alignment (to be produced)
|   `--- SCREENPLAY_GUIDE.md         <- usage patterns & conventions (to be produced)
|--- features/
|   |--- api/
|   |   |--- healthcheck/
|   |   `--- tokenparser/
|   `--- util-tests/
|--- screenplay/
|   |--- abilities/
|   |--- actors/
|   |--- questions/
|   |--- tasks/
|   `--- support/
|--- src/                            <- domain services shared with Cypress project
|--- tooling/
|   |--- cucumber.mjs                <- Cucumber CLI wiring (ESM)
|   `--- playwright.config.ts        <- Playwright test config & shared fixtures
|--- package.json
|--- playwright-report/              <- default Playwright HTML report output
|--- .env, .env.example              <- deterministic config if needed
`--- tsconfig.json
```

## Tooling Decisions
- **Transpilation**: `ts-node/esm` for Cucumber runtime to load TypeScript step definitions without build step; `tsx` script retained for dev ergonomics.
- **Linters/Formatters**: Extendable via ESLint/Prettier (placeholders), focusing initial scope on tests & types.
- **Reporting**: Cucumber JSON + HTML (via `@cucumber/pretty-formatter`) and Playwright HTML reporter for non-BDD suites.
- **Automation Scripts**: npm scripts & Windows batch files mirror Cypress project semantics for developer parity.

## Test Data & Fixtures
- **Shared Utilities**: `src/tokenparser` & `src/services` consumed directly from tests, mirroring util tests from DEMOAPP001.
- **Dynamic Config**: Environment variables (e.g., `API_BASE_URL`) surfaced via `process.env` with defaults pointing to local Express host.

## Quality Gates
1. **Type Safety**: `npm run ts:check` ensures Screenplay layer and steps compile.
2. **BDD Execution**: `npm run test:bdd` orchestrates API + util feature suites.
3. **Smoke Harness**: `RUN_PLAYWRIGHT_API_AND_TESTS.BAT` (pending creation) launches API server then executes BDD suite, logging to `.results`.
4. **CI Hooks**: `npm run verify` aggregates type-check + tests for pipeline integration.

## Next Actions
- Scaffold Screenplay core classes and Cucumber world helpers.
- Port feature files & step definitions from DEMOAPP001 with Playwright adaptations.
- Implement npm/batch scripts for local+CI runs and document QA strategy/ISTQB mapping.

