# DEMOAPP003 - Playwright + TypeScript BDD Skeleton

## Overview
This project mirrors the DEMOAPP001 Cypress suite using Playwright, TypeScript, and the Screenplay pattern. It exercises the shared Token Parser Express API and utility classes while introducing documentation-first quality practices.

## Quick Start
1. Install dependencies: `npm install`
2. Verify Playwright browsers: `npm run pw:install`
3. Start local API (optional - batch script handles this): `npm start`
4. Run the BDD suite: `npm test`

## Scripts
- `npm start` - launch the Token Parser Express API on port 3000.
- `npm run dev` - start the API with hot reload (via `tsx watch`).
- `npm run typecheck` - compile TypeScript in no-emit mode for static analysis.
- `npm test` / `npm run test:bdd` - execute Cucumber features through Playwright Screenplay harness.
- `npm run verify` - gateway script combining typecheck + BDD tests (use in CI).
- `npm run pw:test` - reserved for future Playwright test suites (`tests/` folder).

## Project Structure
```
features/                 # BDD feature files mirrored from DEMOAPP001
screenplay/               # Actors, abilities, tasks, questions, world hooks
src/                      # Shared token parser implementation & Express host
tooling/                  # Cucumber + Playwright configuration assets
docs/                     # QA strategy and Screenplay usage guides
```

## Environment Variables
- `API_BASE_URL` - overrides API host for API scenarios (default: `http://localhost:3000`).
- `APP_BASE_URL` - consumed by Playwright config for future UI specs.
- `CUCUMBER_TIMEOUT`, `CUCUMBER_PARALLEL`, `PLAYWRIGHT_TEST_TIMEOUT` - optional tuning knobs.
- `TOKENPARSER_LOG_LEVEL` - set to `silent`, `error`, `warn`, `info`, or `debug` (default) to control API logging verbosity.

## Reporting
- Cucumber JSON report saved to `.results/playwright_cucumber_report.json`.
- Playwright HTML report stored under `playwright-report/` when `pw:test` runs.

## Extending the Suite
1. Add feature files under `features/` with scenario outlines for data coverage.
2. Implement step definitions leveraging Screenplay tasks/questions.
3. Create new tasks or abilities if workflow cannot reuse existing components.
4. Update documentation (`docs/`) and scripts when new tooling is introduced.

## Compatibility Notes
- Requires Node 18+.
- Uses UTC-aware assertions for date logic to remain stable across time zones.
- Batch scripts assume Windows host; adapt to shell scripts for POSIX CI agents if required.

