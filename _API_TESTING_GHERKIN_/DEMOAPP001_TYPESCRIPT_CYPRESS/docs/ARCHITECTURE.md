# DEMOAPP001 – Cypress Architecture Guide

**Version 2 – 18/11/25**

## 1. Overview
- **Purpose**: Reference implementation of the Token Parser API using Express + TypeScript, paired with Cypress+Badeball Cucumber for Screenplay-driven BDD.
- **Primary Consumers**: DEMOAPP003 (Playwright TS) mirrors this codebase; DEMOAPP002/004 reuse its feature tables and API contract.
- **Automation Entry Points**: `npm run verify`, `.batch/RUN_DEMOAPP001_TYPESCRIPT_CYPRESS_API_AND_TESTS.BAT`, and the repo orchestrator `.batch/RUN_ALL_API_AND_TESTS.BAT`.

## 2. Application Composition
### API Host
- Location: `src/server.ts` bootstraps the shared Express host, Swagger, logging middleware, and two parser endpoints (`/parse-date-token`, `/parse-dynamic-string-token`) backed by the workspace package `packages/tokenparser-api-shared`.
- Configuration: `.env` (and `.env.example`) define `PORT`, `SWAGGER_URL`, and logging flags. Batch helpers hydrate these settings via `env_utils.bat`.
- Logging: Uses the shared token parser logger abstraction (`TOKENPARSER_LOG_LEVEL`). Structured logs bubble into `.results` when the batch runner redirects output.

### Screenplay + Cypress Runtime
- Screenplay modules live under `screenplay/` at the repo root to allow reuse by DEMOAPP003. Cypress references them through `tsconfig.json` path aliases.
- Badeball Cucumber preprocessor drives feature execution. Feature files live under `cypress/e2e/features/**` (API + util tags).
- Custom worlds (`screenplay/core/api-world.ts` and `util-world.ts`) provision actors per scenario and tap into `cypress/support/e2e.ts`.

### Tooling & Automation
- `package.json` scripts:
  - `npm run start` / `npm run dev`: start the Express API.
  - `npm run ts:check`: `tsc --noEmit` covering `src`, `screenplay`, and `cypress`.
  - `npm run lint` / `lint:fix` (ESLint) and `npm run format` / `format:fix` (Prettier) across all TS folders.
  - `npm run test:bdd`: Cypress headless run with default reporters.
  - `npm run verify`: type check + Cypress suite (CI default).
- `.batch/RUN_DEMOAPP001_TYPESCRIPT_CYPRESS_API_AND_TESTS.BAT`: orchestrates util tests first, starts the API if port 3000 is free, opens Swagger, runs `npm run verify`, and captures `.results/demoapp001_typescript_cypress_<UTC>.txt` logs.
- `.batch/RUN_ALL_APIS_AND_SWAGGER.BAT`: starts this API alongside the .NET, Playwright TS, and Python FastAPI hosts for contract inspections.

## 3. Folder Map
```
DEMOAPP001_TYPESCRIPT_CYPRESS
├─ docs/ (architecture, QA, Screenplay)
├─ cypress/
│  ├─ e2e/features/api|util
│  └─ support/step_definitions + screenplay glue
├─ screenplay/  (shared Screenplay implementation)
├─ src/         (Express host + token parser services)
├─ .results/    (created by batch tooling)
├─ cypress.config.ts
├─ tsconfig.json (path aliases for src + screenplay)
├─ package.json / lockfile
└─ .env / .env.example
```

## 4. Runtime Interactions
1. `.batch` script loads env vars, probes port 3000, and launches `npm run start` if needed.
2. Express host exposes Swagger and tokens; Cypress util tests hit parser modules directly, API tests hit the HTTP endpoints.
3. Screenplay actors store responses/memory under `screenplay/support/memory-keys.ts`.
4. Test results stream to stdout; orchestrator pipes them into `.results` and aggregates metrics via `.batch/.ps/render-run-metrics.ps1`.

## 5. Operational Considerations
- **Parity**: Any change to feature tables or token parser logic must be propagated to DEMOAPP003 (TypeScript Playwright) and mirrored in SpecFlow/pytest docs. Track updates in `API Testing POC/DEMO_DOCS/screenplay_parity_demoapps.md`.
- **Pre-flight Checks**: Run `npm run lint`, `npm run format`, and `npm run ts:check` before BDD runs to keep IDE feedback fast.
- **Metrics**: Repository-level orchestrations produce `.results/run_metrics_<UTC>.{metrics,txt,md}`. These entries reference DEMOAPP001 log files and should stay green before merging.
- **Dependencies**: Cypress install scripts attempt to verify browsers; use `npm install --ignore-scripts` when CI restrictions apply, then run `npx cypress verify` manually.

## 6. References
- README (`_API_TESTING_GHERKIN_/DEMOAPP001_TYPESCRIPT_CYPRESS/README.md`) for setup commands.
- QA strategy (`docs/QA_STRATEGY.md`) and Screenplay guide (`docs/SCREENPLAY_GUIDE.md`) for testing details.
- Shared docs: `API Testing POC/DEMO_DOCS/batch_runner_design.md`, `.../screenplay_parity_demoapps.md`, and `.../tokenparser_api_contract.md`.
