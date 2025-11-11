# QA Strategy for DEMOAPP003 (Playwright + TypeScript)

**Version 2 - [12/11/25]**

## Purpose
This strategy governs quality activities for the Playwright-based automation suite that validates the Token Parser API surface and supporting utilities. It aligns with ISTQB test management principles while elevating critical practices (risk-based prioritisation, modern observability, and shift-left automation).

## Guiding Principles
1. **Value-Driven Coverage** - focus on behaviours that matter to the business by mirroring BDD scenarios and contract expectations from DEMOAPP001.
2. **Risk-Based Planning** - classify features using probability/impact scoring. High-risk API flows (e.g., token parsing) get automated regression, contract tests, and negative-path coverage; low-risk ancillary endpoints receive lightweight smoke monitoring.
3. **Shift-Left Feedback** - enforce `typecheck` + BDD execution in the `verify` script and CI gates to surface design issues before deployment.
4. **Testability & Observability** - centralise logs via Screenplay notes, capture Playwright traces on failure, and emit Cucumber JSON for analytics pipelines.
5. **Continuous Improvement** - review flaky tests weekly, track mean-time-to-detect (MTTD) and mean-time-to-repair (MTTR), and adjust story-level DoD accordingly.

## Test Levels & Scope
| Level | Goal | Coverage Approach |
|-------|------|-------------------|
| **Component** | Validate token parser utilities deterministically | Direct invocation via Screenplay abilities in util features; Playwright `expect` APIs enforce UTC-stable results. |
| **API** | Assure contract fidelity, status codes, and payload semantics | BDD scenarios issue HTTP calls via `CallAnApi` ability; includes positive, negative, and boundary cases. |
| **Integration** | Confirm Express host + parsers + config interplay | Batch script spins up API service before suite; future CI runs can target containerised instance. |
| **End-to-End (future)** | UI/consumer perspective | Placeholder `tests` directory + Playwright config to allow extension when UI coverage is required. |

## Test Types
- **Functional BDD** - primary automated suite triggered via `npm run test:bdd`.
- **Regression Packs** - nightly pipeline executes entire feature set plus `npm run typecheck` (ISTQB maintenance regression principle).
- **Smoke/Health** - batch script + healthcheck feature ensures endpoint availability.
- **Negative Testing** - invalid tokens, malformed inputs, and error messaging scenarios are required before release.

## Risk & Prioritisation Matrix
| Risk Tier | Examples | Automation Action |
|-----------|----------|--------------------|
| High | Token date math, dynamic string generation, Swagger contract | Mandatory automated regression + data-driven examples |
| Medium | Health endpoints, logging hooks | Smoke coverage; escalate to regression if production incidents occur |
| Low | Non-functional assets (docs, static files) | Manual spot checks |

## Test Data & Environments
- Deterministic UTC calculations enforced by `getStartDateUTC`; ensure system clock is synchronised in CI agents.
- Token strings maintained in feature files; extend via Examples tables to prevent data drift.
- Environment variables: `API_BASE_URL`, `APP_BASE_URL`, `CUCUMBER_TIMEOUT`, `PLAYWRIGHT_*` for per-environment tuning.

## Execution & Reporting
- **Local workflow**:
  - `npm run lint` / `npm run format` guard style gates (scoped to tests + Screenplay per tooling decision).
  - `npm run verify` combines `ts:check` + BDD run before commits.
- **CI**:
  - Pull requests call `npm run lint`, `npm run format`, and `npm run verify`.
  - Nightly job archives `playwright-report/` and `.results/playwright_cucumber_report.json`.
- **Batch Harness**:
  - `.batch/RUN_DEMOAPP003_TYPESCRIPT_PLAYWRIGHT_API_AND_TESTS.BAT` bootstraps env vars via `env_utils.bat`, starts the API, runs `npm run verify`, and tears everything down.
  - `.batch/RUN_ALL_APIS_AND_SWAGGER.BAT` is used when validating multi-stack parity; ensure it is re-run after any script changes.

## Quality Metrics
- **Automation Rate**: % of critical scenarios automated (target 80%+).
- **Stability**: <2% flaky failures per 10 runs.
- **Defect Leakage**: track issues found post-deployment vs. within automation.
- **Lead Time**: average time from commit to green pipeline; feed into continuous improvement retrospectives.

## Roles & Responsibilities
- **Test Automation Architect (you)** - own framework evolution, coding standards, pipeline alignment.
- **QA Engineers** - contribute new BDD scenarios, maintain Screenplay tasks, review failures.
- **Developers** - supply contract changes via Swagger, collaborate on Step definition reuse.
- **Ops/Platform** - maintain CI runners, secrets, and environment parity.

## ISTQB Alignment Highlights
- Test Process (Plan -> Monitor -> Control) reflected by backlog of BDD scenarios and run dashboards.
- Risk-Based Testing applied via matrix and sprint planning acceptance criteria.
- Static Testing via TypeScript compilation and code reviews preceding execution.
- Test Management emphasises traceability: feature files reference business flows, step definitions map to reusable Screenplay tasks.

## Next Iterations
1. Backfill contract assertions by parsing Swagger via Zod (dependency already available).
2. Add lightweight performance probes (avg latency) to nightly `npm run verify` executions.
3. Publish lint + format status badges so tooling expectations remain visible in READMEs.

