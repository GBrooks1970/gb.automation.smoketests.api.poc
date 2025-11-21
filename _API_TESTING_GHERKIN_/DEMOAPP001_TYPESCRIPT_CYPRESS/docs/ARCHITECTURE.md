# DEMOAPP001 – Cypress Architecture Guide

**Version 3 – 21/11/25**

## 1. Overview
- **Purpose**: Reference implementation of the Token Parser API using the shared Express host in `packages/tokenparser-api-shared`, paired with Cypress + Screenplay-powered BDD.
- **Primary Consumers**: DEMOAPP003 (Playwright TS) mirrors the same tests and parser helpers; DEMOAPP002/004 reuse the shared feature files and API contract documentation.
- **Automation Entry Points**: `npm run verify`, `.batch/RUN_DEMOAPP001_TYPESCRIPT_CYPRESS_API_AND_TESTS.BAT`, and the orchestrator `.batch/RUN_ALL_API_AND_TESTS.BAT`.

## 2. Application Composition
### API Host
- Host: `packages/tokenparser-api-shared/dist/cli/start.js` launches the Express server, Swagger routes, and the parser endpoints (`/alive`, `/parse-date-token`, `/parse-dynamic-string-token`). `npm run start` in this folder executes the CLI with `--port 3000 --label DEMOAPP001`.
- Configuration: `.env` (and `.env.example`) define `PORT`, `SWAGGER_URL`, and logging flags. `.batch/env_utils.bat` hydrates these before the CLI runs so all TypeScript stacks share the *same* `.env.demoapp_ts_api` template.
- Logging: `TOKENPARSER_LOG_LEVEL` + `TOKENPARSER_LOGGER_CATEGORY` inside the CLI control the shared `Logger`. Batch runners emit their stdout/stderr into `.results/demoapp001_typescript_cypress_<UTC>.txt` for later analysis.

### Screenplay + Cypress Runtime
- Screenplay helpers live under `screenplay/`; Cypress references them directly (no `src` alias) via `tsconfig` entries for the shared folders.
- Feature files live under `cypress/integration/**` (util vs API). Automated worlds (`screenplay/core/api-world.ts`, `util-world.ts`) instantiate actors and abilities, including `UseTokenParsers`, which now imports directly from `tokenparser-api-shared`.
- `cypress/support/e2e.ts` wires in the worlds so every scenario receives the consistent actor/ability set.

### Tooling & Automation
- `npm run start` / `npm run dev`: start the shared Express API via `node ../../packages/tokenparser-api-shared/dist/cli/start.js --port 3000 --label DEMOAPP001`.
- `npm run ts:check`: `tsc --noEmit` covering `screenplay`, `cypress`, and type declarations.
- `npm run lint` / `lint:fix` (ESLint) and `npm run format` / `format:fix` (Prettier) remain scoped to Cypress + Screenplay sources.
- `npm run test:bdd`: headless Cypress run with default reporters.
- `npm run verify`: type check + Cypress suite (CI default).
- `.batch/RUN_DEMOAPP001_TYPESCRIPT_CYPRESS_API_AND_TESTS.BAT`: orchestrates util tests first, starts the shared CLI when port 3000 is free, opens Swagger, runs the full suite, and records `.results` logs.
- `.batch/RUN_ALL_APIS_AND_SWAGGER.BAT`: launches this API (via its CLI) alongside the .NET, Playwright TS, and Python hosts for contract inspections.

## 3. Folder Map
```
DEMOAPP001_TYPESCRIPT_CYPRESS
├─ docs/ (architecture, QA, Screenplay)
├─ cypress/ (feature files + step definitions)
├─ screenplay/ (actors, abilities, tasks, questions, worlds)
├─ types/ (ambient declarations)
├─ .results/ (batch log captures)
├─ cypress.config.ts
├─ tsconfig.json (targets Cypress + Screenplay)
├─ package.json / package-lock
└─ .env / .env.example
```

> **Shared API Note:** This repo no longer contains the API host. The Express server, parsers, logging helpers, and Swagger wiring live in `packages/tokenparser-api-shared` and are started via `npm run start`. Cypress and Screenplay abilities import parser helpers directly from that package.

## 4. Runtime Interactions
1. `.batch/RUN_DEMOAPP001_TYPESCRIPT_CYPRESS_API_AND_TESTS.BAT` loads env vars, probes port 3000, and launches the shared CLI if the port is free.
2. The shared Express host exposes Swagger + parser endpoints; Cypress util tests exercise the parser classes via `UseTokenParsers`, API tests hit the HTTP routes through `SendGetRequest`.
3. Screenplay actors store responses/memory in `screenplay/support/memory-keys.ts`.
4. Results stream to stdout; the orchestrator pipes them into `.results` and aggregates metrics via `.batch/.ps/render-run-metrics.ps1`.

## 5. Operational Considerations
- **Parity**: Any parser/API change must be mirrored in DEMOAPP003 and documented for DEMOAPP002/004 in `API Testing POC/DEMO_DOCS/screenplay_parity_demoapps.md`.
- **Pre-flight Checks**: Run `npm run lint`, `npm run format`, and `npm run ts:check` before BDD runs for fast IDE feedback.
- **Metrics**: Orchestrator executions write `.results/run_metrics_<UTC>.{metrics,txt,md}` referencing DEMOAPP001 logs; keep those files green before merging.
- **Dependencies**: Cypress install scripts verify browsers; when CI restricts scripts, `npm install --ignore-scripts` + `npx cypress verify` is the fallback.

## 6. References
- README (`_API_TESTING_GHERKIN_/DEMOAPP001_TYPESCRIPT_CYPRESS/README.md`) for setup commands.
- QA strategy (`docs/QA_STRATEGY.md`) and Screenplay guide (`docs/SCREENPLAY_GUIDE.md`) for testing guidance.
- Shared docs: `API Testing POC/DEMO_DOCS/batch_runner_design.md`, `.../screenplay_parity_demoapps.md`, and `.../tokenparser_api_contract.md`.
