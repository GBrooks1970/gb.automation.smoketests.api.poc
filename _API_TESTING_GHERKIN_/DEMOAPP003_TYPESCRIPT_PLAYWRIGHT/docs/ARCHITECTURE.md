# DEMOAPP003 – Playwright BDD Architecture Guide

**Version 3 – 21/11/25**

## 1. Overview
- **API Host**: Shared Express server powered by `packages/tokenparser-api-shared`; this folder contains tests, tooling, and documentation that sit on top of that host.
- **Automation Stack**: Playwright + Cucumber (via `@cucumber/cucumber`) with Screenplay abstractions reusing the same modules as DEMOAPP001.
- **Goal**: Maintain parity between Cypress and Playwright flows while consuming the same parser logic and API contract from the shared package.

## 2. Components
| Component | Location | Notes |
| --- | --- | --- |
| Token Parser API | `packages/tokenparser-api-shared/dist/cli/start.js` | Shared Express host + parser routing; started with `npm run start` on port `3001`. |
| Feature files | `features/` | BDD specs (util + API tags). |
| Screenplay | `screenplay/` | Shared with DEMOAPP001; reuses `UseTokenParsers` and other abilities that import from `tokenparser-api-shared`. |
| Tooling | `tooling/` | Cucumber CLI wrappers, summary renderer, Playwright config. |
| Docs | `docs/` | Architecture, QA strategy, Screenplay guide. |

## 3. Runtime Flow
1. `.batch/RUN_DEMOAPP003_TYPESCRIPT_PLAYWRIGHT_API_AND_TESTS.BAT` loads env vars, probes port 3001, and starts the shared CLI if needed.
2. Parser endpoints (`/parse-date-token`, `/parse-dynamic-string-token`) live inside the shared package; Playwright step definitions import parser helpers from `tokenparser-api-shared`, not a local `src`.
3. Screenplay actors use Playwright `APIRequestContext` to hit the API, while util scenarios exercise parsers directly via `UseTokenParsers`.
4. Logs land in `.results/demoapp003_typescript_playwright_<UTC>.txt`; orchestrator lumps them under the Playwright TS label.

## 4. Tooling & Automation
- `npm run start` / `npm run dev`: starts the shared CLI with `--port 3001 --label DEMOAPP003`.
- `npm run ts:check`: runs `tsc --noEmit` over features, Screenplay, and tooling.
- `npm run lint` / `format`: target Playwright + Screenplay sources only.
- `npm run test:bdd`: executes Cucumber + custom renderer; harness imports parser helpers directly from the shared package.
- `npm run verify`: convenience alias that chains `ts:check` + `test:bdd`.
- `npm run pw:install`: downloads Playwright browsers required for future UI suites.

## 5. Folder Snapshot
```
DEMOAPP003_TYPESCRIPT_PLAYWRIGHT
├─ docs/
├─ features/
├─ screenplay/
├─ tooling/
├─ types/
├─ .results/
├─ package.json / package-lock
└─ .env / .env.example
```

> **Shared API Note:** The Express host, parser logic, logging helpers, and Swagger wiring now live entirely in `packages/tokenparser-api-shared`. This folder imports parser helpers directly from that package, so no `src/` API code remains locally.

## 6. Operational Considerations
- Keep Screenplay helpers aligned with DEMOAPP001 to ensure parity; update `API Testing POC/DEMO_DOCS/screenplay_parity_demoapps.md` when adding actors/abilities.
- `TOKENPARSER_LOG_LEVEL` and `TOKENPARSER_LOGGER_CATEGORY` are defined in `.env.demoapp_ts_api`; adjust that template instead of editing per stack.
- `.batch/RUN_ALL_API_AND_SWAGGER.BAT` includes this CLI when launching multiple APIs for contract and Swagger checks.

## 7. References
- README (`_API_TESTING_GHERKIN_/DEMOAPP003_TYPESCRIPT_PLAYWRIGHT/README.md`)
- QA strategy (`docs/QA_STRATEGY.md`) and Screenplay guide (`docs/SCREENPLAY_GUIDE.md`)
