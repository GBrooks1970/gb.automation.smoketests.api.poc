# QA Strategy for DEMOAPP001 (Cypress + TypeScript)

**Version 1 - [12/11/25]**

## Purpose
Define how the Cypress-based suite validates the Token Parser API/utilities while staying parity-aligned with the Playwright stack. Strategy ties back to ISTQB principles and the documented Screenplay pattern.

## Guiding Principles
1. **Parity First** – whenever a capability lands in one TypeScript stack, mirror the implementation (actors, tasks, questions) in the other.
2. **Risk-Based Coverage** – prioritise token parsing, dynamic date math, and health endpoints; de-prioritise low-risk static content.
3. **Shift-Left** – `npm run lint`, `npm run format`, `npm run ts:check`, and `npm run test:bdd` compose the `verify` workflow before PRs.
4. **Deterministic Data** – UTC calculations use `TokenDateParser` helpers and `date-fns` utilities to keep assertions stable.
5. **Actionable Observability** – leverage Screenplay memory plus Cypress screenshots/videos (when enabled) for failure triage.

## Test Levels & Scope
| Level | Goal | Approach |
| --- | --- | --- |
| Component | Validate parser utilities without HTTP | `@UTILTEST` features call `UseTokenParsers` directly via Screenplay tasks |
| API | Confirm contract, status, payload schema | `CallAnApi` ability issues requests to local Express host; assertions via Questions |
| Integration | Ensure Express host + parser modules stay wired correctly | `.batch/RUN_DEMOAPP001_TYPESCRIPT_CYPRESS_API_AND_TESTS.BAT` starts the API before tests |
| End-to-End (future) | UI/consumer validations | Placeholder only; use Playwright stack if UI coverage is needed sooner |

## Test Types
- **Functional BDD** – primary automation triggered with `npm run test:bdd`.
- **Regression** – nightly `npm run verify` plus `RUN_ALL_APIS_AND_SWAGGER.BAT` to confirm shared services boot.
- **Smoke/Health** – `/alive` endpoint scenarios plus batch harness for quick local validation.
- **Negative** – invalid tokens, malformed payloads, error messaging (must exist before release).

## Tooling & Execution
- **Local workflow**:
  - `npm install --ignore-scripts` (workaround for failing `postinstall`), then `npx cypress verify` if binaries missing.
  - `npm run lint` → `npm run format` → `npm run verify` ahead of commits.
- **CI workflow**:
  - `npm ci --ignore-scripts`, then manually invoke `npx cypress verify` before `npm run verify`.
  - Publish `.results/demoapp001_typescript_cypress_*.txt` artefacts for traceability.
- **Batch Harness**:
  - `.batch/RUN_DEMOAPP001_TYPESCRIPT_CYPRESS_API_AND_TESTS.BAT` orchestrates env vars, starts the API, executes `npm run verify`, and tears everything down via `env_utils.bat`.
  - `.batch/RUN_ALL_APIS_AND_SWAGGER.BAT` is rerun after any change to server startup or `.env` contracts.

## Risk Matrix
| Tier | Examples | Automation Action |
| --- | --- | --- |
| High | Dynamic date parsing, contract endpoints | Always automated, include negative cases |
| Medium | Health checks, Swagger docs | Smoke + regression on-demand |
| Low | Static assets, docs | Manual spot checks |

## Metrics
- **Automation Rate**: % of user stories with Screenplay steps in both stacks.
- **Flake Count**: keep Cypress retries <2% across ten consecutive runs.
- **Lead Time**: time between commit and green `RUN_DEMOAPP001...` harness execution.

## Responsibilities
- **Automation owner**: curates Screenplay modules, ensures parity with DEMOAPP003.
- **QA engineers**: add features/step defs, keep lint/format clean, document new behaviours in `docs/`.
- **Developers**: notify automation when Express routes or parser logic changes.
- **Ops**: maintain `.batch` scripts and `env_utils.bat`.

## Next Steps
1. Expand regression data sets for `TokenDynamicStringParser`.
2. Hook `.results` uploads into central reporting.
3. Keep parity doc (`API Testing POC/screenplay_parity_typescript.md`) synced whenever new abilities or memory keys land.
