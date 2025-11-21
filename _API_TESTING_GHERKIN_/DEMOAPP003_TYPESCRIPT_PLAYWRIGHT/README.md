# DEMOAPP003 - Playwright BDD + Screenplay (TypeScript)

TypeScript demo that mirrors DEMOAPP001 but uses Playwright request contexts and `@cucumber/cucumber`. Feature files, Screenplay helpers, and parser logic stay in sync with the Cypress stack through the shared package.

---

## Structure

```
features/               # Gherkin specs (API + @UTILTEST)
screenplay/             # Actors, abilities, tasks, questions, world hooks
tooling/                # Cucumber config, summary renderer, Playwright config
docs/                   # Architecture, QA strategy, Screenplay guide
.batch/                 # Shared batch scripts
types/                  # Playwright/Cucumber type declarations
```

Instrumentation and the Token Parser API are provided by `packages/tokenparser-api-shared`; this folder only holds tests, tooling, and docs.

---

## Install and Setup

1. `cd _API_TESTING_GHERKIN_/DEMOAPP003_TYPESCRIPT_PLAYWRIGHT`
2. `npm install`
3. `npm run pw:install` (downloads Playwright browsers)

Batch scripts call `.batch/env_utils.bat load_env_vars` so `PORT`, `API_BASE_URL`, and `TOKENPARSER_LOG_LEVEL` track the shared `.env.demoapp_ts_api` template. When you change logging, update that template once rather than per stack.

---

## Scripts

| Command | Description |
| --- | --- |
| `npm run start` | Starts the shared Express host (`packages/tokenparser-api-shared/dist/cli/start.js`) on port `3001`. |
| `npm run dev` | Alias of `npm run start` for consistency with the shared CLI. |
| `npm run ts:check` | `tsc --noEmit` across features, Screenplay, and tooling. |
| `npm run lint` / `npm run format` | ESLint/Prettier across Playwright/Screenplay sources. |
| `npm run test:bdd` | Runs `tooling/run-cucumber-with-summary.cjs` to execute Cucumber + renderer; uses shared parser assertions from `tokenparser-api-shared`. |
| `npm run verify` | Type-check + BDD suite; matches DEMOAPP001 `npm run verify`. |
| `npm run pw:test` | Reserved for future Playwright UI tests. |

---

## Shared Token Parser API

- **Startup**: `npm run start` executes `node ../../packages/tokenparser-api-shared/dist/cli/start.js --port 3001 --label DEMOAPP003`.
- **Imports**: Playwright actors and step definitions import parser utilities and `DateUtils` directly from `tokenparser-api-shared`, so no app-local parser copies exist.
- **Build**: run `npm run shared:build` at the repo root whenever shared code changes so both TypeScript stacks read updated `dist/`.
- **Logging**: The CLI honours `TOKENPARSER_LOG_LEVEL` + `TOKENPARSER_LOGGER_CATEGORY`; `.batch/RUN_DEMOAPP003_TYPESCRIPT_PLAYWRIGHT_API_AND_TESTS.BAT` captures output under `.results/` files.

---

## Running Tests

- Util coverage: `npm run test:bdd -- --tags @UTILTEST` runs parser-focused scenarios via Screenplay actors that leverage `tokenparser-api-shared`.
- Full suite: `npm run test:bdd` (Cucumber + renderer).
- Summary renderer emits Markdown/ASCII used by the orchestrator; keep `tooling/cucumber-summary.cjs` aligned with walker logs.

---

## Automation Script

```bat
call .batch\RUN_DEMOAPP003_TYPESCRIPT_PLAYWRIGHT_API_AND_TESTS.BAT
```

The runner:

1. Loads `.env` overrides and sets the Playwright API base URL.
2. Starts the shared API on port `3001` via the CLI when needed.
3. Runs util specs before the full suite.
4. Stops the shared server it launched and writes logs to `.results/demoapp003_typescript_playwright_<UTC>.txt`.

---

## Documentation

- `docs/ARCHITECTURE.md` / `docs/SCREENPLAY_GUIDE.md` / `docs/QA_STRATEGY.md` – describe how this stack consumes the shared Express host and parser helpers.
- Util coverage: `npm run test:bdd -- --tags @UTILTEST` runs parser-focused scenarios via Screenplay actors that leverage `tokenparser-api-shared`. |
- Full suite: `npm run test:bdd` (Cucumber + renderer). |
- Summary renderer emits Markdown/ASCII used by the orchestrator; keep `tooling/cucumber-summary.cjs` aligned with walker logs. |
- Automation script... (should remove? not there)
- Running Tests
