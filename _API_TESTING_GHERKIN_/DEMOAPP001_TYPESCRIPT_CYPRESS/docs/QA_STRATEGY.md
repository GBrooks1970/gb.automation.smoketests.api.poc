# QA Strategy – DEMOAPP001 (TypeScript + Cypress)

**Version 2 – 18/11/25**

## 1. Objectives
1. Maintain a canonical reference suite for the Token Parser API covering util (parser-only) and API scenarios.
2. Keep Screenplay artefacts aligned with DEMOAPP003 (Playwright TS) and mirrored in DEMOAPP002/004 through shared feature tables.
3. Provide deterministic results to the batch orchestrator so `.results/run_metrics_<UTC>.txt` remains authoritative during CI/CD.

## 2. Test Inventory
| Layer | Scope | Implementation | Frequency |
| --- | --- | --- | --- |
| Unit | Parser behaviours, logging helpers | `src/tokenparser/**` with Jest-style `npm run test:unit` (roadmap) | Optional / PR |
| Component | Token parser modules without HTTP | `@UTILTEST` Scenario Outlines executed via Screenplay abilities | Every run |
| API / Contract | `/alive`, `/parse-date-token`, `/parse-dynamic-string-token` | Cypress API features (`cypress/e2e/features/api`) | Every run |
| Integration | Batch warm-up & Swagger verification | `.batch/RUN_ALL_APIS_AND_SWAGGER.BAT` | Before parity pushes |
| Regression Metrics | Aggregated suite counts | `.batch/RUN_ALL_API_AND_TESTS.BAT` | Nightly & pre-release |

## 3. Automation Gates
1. `npm run lint` (ESLint) – fails on warnings to prevent drift.
2. `npm run format` (Prettier check) – keep formatting consistent with DEMOAPP003.
3. `npm run ts:check` – TypeScript noEmit compile.
4. `npm run test:bdd` – Cypress headless tests with JSON reporter configured in `cypress.config.ts`.
5. `npm run verify` – convenience alias for CI (steps 3 + 4).
6. `.batch/RUN_DEMOAPP001_TYPESCRIPT_CYPRESS_API_AND_TESTS.BAT` – ensures the same lifecycle used by orchestrator.

## 4. Metrics & Reporting
- **Run Metrics**: Each orchestrated execution writes `<Suite>_Exit` and `<Suite>_Log` pairs to `run_metrics_<UTC>.metrics`. The renderer extracts pass/fail counts from Cypress output (22 util + api tests as of 18/11/25).
- **Parity Drift**: Track `% of feature tables synced` using `API Testing POC/DEMO_DOCS/screenplay_parity_demoapps.md`.
- **Flake Monitoring**: Capture rerun counts by enabling Cypress retry plugin (roadmap) and logging to `.results`.
- **Lead Time**: Document how long it takes to port a new scenario from DEMOAPP001 to the other stacks inside `API Testing POC/DEMO_DOCS/Backlog_Parity.md`.

## 5. Risk-Based Focus
| Tier | Description | Mitigation |
| --- | --- | --- |
| High | Date parsing ranges, dynamic tokens with `[ALPHA|NUMERIC|LINES]` syntax | Multiple Scenario Outline rows, strict UTC comparison helper, Screenplay assertions |
| Medium | `/alive` regressions, Swagger docs, logging | Smoke steps within API feature + manual check when batch warm-up runs |
| Low | CLI/Batch glue, docs | Verified through `.batch/RUN_ALL_APIS_AND_SWAGGER.BAT` and documentation review |

## 6. Execution Recipes
### Local Developer Loop
```
npm install
npm run lint && npm run format
npm run ts:check
npm run test:bdd -- --env grepTags='@util or @api'
```
Optional: `npm run cy:open` for GUI exploration.

### Batch / CI
1. `.batch/RUN_DEMOAPP001_TYPESCRIPT_CYPRESS_API_AND_TESTS.BAT`
2. `.batch/RUN_ALL_API_AND_TESTS.BAT` (aggregates util + api counts)
3. Upload `.results/demoapp001_typescript_cypress*_*.txt` as artefacts for traceability.

## 7. Open Improvements
1. Formalise parser unit tests under `src/tokenparser/__tests__`.
2. Capture Cypress screenshots/video and attach to logs for failing scenarios.
3. Add coverage instrumentation (Istanbul) to quantify parser/API hit rates.
4. Automate parity validation via script that diffs DEMOAPP001 feature tables against down-stream stacks.
