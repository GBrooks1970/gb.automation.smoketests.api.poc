# DEMOAPP003 - Playwright BDD + Screenplay (TypeScript)

TypeScript demo that mirrors DEMOAPP001 but uses Playwright request contexts and `@cucumber/cucumber`. Feature files, Screenplay helpers, and parser logic stay in sync with the Cypress stack.

---

## Structure

```
src/                    # Express API + token parser implementations (port 3001)
features/               # Gherkin specs (API + @UTILTEST)
screenplay/             # Actors, abilities, tasks, questions, world hooks
tooling/                # Cucumber config, summary renderer, Playwright config
docs/                   # Architecture, QA strategy, Screenplay guide
```

---

## Install and Setup

1. `cd _API_TESTING_GHERKIN_/DEMOAPP003_TYPESCRIPT_PLAYWRIGHT`
2. `npm install`
3. Install Playwright browsers: `npm run pw:install`

Default ports and base URLs come from `.env`; automation scripts call `env_utils.bat load_env_vars` so Screenplay abilities pick up overrides automatically.

---

## Scripts

| Command | Description |
| --- | --- |
| `npm run start` | Start the Express API on port `3001`. |
| `npm run dev` | Start the API with hot reload. |
| `npm run ts:check` | Type-check without emitting. |
| `npm run test:bdd` (alias `npm test`) | Run Cucumber specs through Playwright request fixtures. |
| `npm run verify` | `ts:check` + `test:bdd`. |
| `npm run pw:test` | Reserved for Playwright UI tests (future). |

Swagger JSON is hosted at `http://localhost:3001/swagger/v1/swagger.json`.

---

## Running Tests

- Util coverage: `npm run test:bdd -- --tags @UTILTEST`
- Full suite: `npm run test:bdd`
- Cucumber JSON output: `.results/playwright_cucumber_report.json`
- Summary renderer: `tooling/run-cucumber-with-summary.cjs` executes Cucumber and then calls `tooling/cucumber-summary.cjs` to emit logs for the orchestrator.

---

## Automation Script

```bat
call .batch\RUN_DEMOAPP003_TYPESCRIPT_PLAYWRIGHT_API_AND_TESTS.BAT
```

The runner:

1. Loads `.env` overrides and sets `API_BASE_URL`.
2. Starts the API on port `3001` when needed and opens Swagger.
3. Runs util specs (`@UTILTEST`) first.
4. Runs the full suite.
5. Stops the API it launched and writes logs to `.results/demoapp003_typescript_playwright_<UTC>.txt`.

---

## Documentation

- `docs/ARCHITECTURE.md`
- `docs/QA_STRATEGY.md`
- `docs/SCREENPLAY_GUIDE.md`
