# QA Strategy – DEMOAPP003 (TypeScript + Playwright)

**Version 2 – 18/11/25**

## 1. Intent
- Validate the Token Parser API using Playwright's HTTP client while mirroring DEMOAPP001 feature coverage.
- Provide async Screenplay reference code for future TypeScript projects (UI + API).
- Feed clean metrics/logs to `.batch/RUN_ALL_API_AND_TESTS.BAT`.

## 2. Coverage Matrix
| Layer | Description | Command |
| --- | --- | --- |
| Static Analysis | ESLint/Prettier/TS compile across `src`, `screenplay`, `features` | `npm run lint`, `npm run format`, `npm run ts:check` |
| Util Scenarios | Parser-only validation (`@UTILTEST`) | `npm run test:bdd -- --tags @UTILTEST` |
| API Scenarios | `/alive`, `/parse-*` endpoints | `npm run test:bdd` |
| Integration | API start/stop validation | `.batch/RUN_DEMOAPP003_TYPESCRIPT_PLAYWRIGHT_API_AND_TESTS.BAT` |
| Cross-stack Regression | All demos sequentially | `.batch/RUN_ALL_API_AND_TESTS.BAT` |

## 3. Execution Flow
1. `npm install` (ensures Playwright browsers installed via postinstall script or `npx playwright install`).
2. `npm run lint && npm run format && npm run ts:check`.
3. `npm run test:bdd -- --tags @UTILTEST`.
4. `npm run test:bdd`.
5. For parity verification, run `.batch/RUN_DEMOAPP003_TYPESCRIPT_PLAYWRIGHT_API_AND_TESTS.BAT`.

## 4. Metrics & Reporting
- Playwright runner writes JSON + console logs consumed by `tooling/summary_renderer.ts`.
- `.results/demoapp003_typescript_playwright_<UTC>.txt` is parsed by the orchestrator under the `Playwright TS` label.
- Metrics tracked: total tests (55 as of 18/11/25), passes/fails/skips, duration (added to renderer when available).

## 5. Risks & Controls
| Risk | Control |
| --- | --- |
| Drift vs Cypress stack | Shared Screenplay modules + parity checklist enforcement. |
| Async/await mis-use | Tasks strictly return `Promise<void>`; worlds wrap them in Playwright test fixtures. |
| Environment mismatches | `.env` loaded by `env_utils.bat`, `API_BASE_URL` enforced before tests run. |
| Logging noise | Honour `TOKENPARSER_LOG_LEVEL` to keep CI logs concise. |

## 6. Outstanding Improvements
1. Add component-level parser tests (Jest or Vitest) similar to DEMOAPP001 backlog.
2. Emit Playwright traces for failing API calls (useful when debugging contract regressions).
3. Parameterise Scenario Outline data from a shared JSON/YAML file to avoid manual duplication.
4. Publish summary renderer output as Markdown to docs for auditing.
