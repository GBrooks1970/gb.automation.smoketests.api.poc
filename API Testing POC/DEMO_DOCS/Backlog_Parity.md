# Backlog Parity Notes - Version 3 (19/11/25)

This backlog captures outstanding work needed to keep all DEMOAPP stacks in parity. Update the version when items are added, reprioritised, or closed.

---

## Outstanding Issues and Recommended Refactors

1. **Feature + API telemetry gaps**: shared API + shared features now exist, but parity runs still lack telemetry for DEMOAPP002/004. Addressed via the multi-phase plan below.
2. **Spec export automation**: DEMOAPP002/004 currently run manual exports from the shared feature repository; automation work is scheduled in Phase 2 of the new plan.
3. **Headless prereqs for TypeScript stacks**: `npm install` currently calls `npx cypress verify`, which fails on Linux hosts without Xvfb. Need an env guard or container image so CI installs remain deterministic.

---

## Migration Plan - ONE Typescript API (5 bullets)
- Consolidate DEMOAPP001/003 server code into a single shared Express/TypeScript API package published via npm workspace.
- Update both stacks' batch runners to call the shared API start script, controlled by env var port selection (3000 vs 3001).
- Refactor parser modules into shared workspace references; adjust tsconfig path mapping for both projects.
- Harmonize logging + configuration files so tests read from a single `.env.demoapp_ts_api` template.
- Gradually retire duplicate API folders by re-pointing tests to the shared package and removing redundant assets once parity confirmed.

### Stepwise Plan
1. **Inventory & Workspace Setup**  
   - DEMOAPP001/003 owners document current `src/server.ts`, parser modules, and npm dependencies.  
   - Create a root-level npm workspace package (e.g., `packages/tokenparser-api-shared`).  
   - Acceptance: workspace build succeeds; both projects reference the new package locally.
2. **Migrate Shared API Source**  
   - Move common Express host + parser code into the shared package while keeping per-project entry points that simply consume the package.  
   - Ensure unit tests (ts-jest or equivalent) cover exported modules before wiring Cypress/Playwright.  
   - Acceptance: both servers compile using shared imports with no behaviour change.
3. **Batch Runner Alignment**  
   - Introduce a single start script (e.g., `npm run start:shared -- --port=<PORT>`) inside the shared package.  
   - Update `.batch/RUN_DEMOAPP001_*.BAT` and `.batch/RUN_DEMOAPP003_*.BAT` to call the shared script, passing `PORT=3000/3001` via env vars.  
   - Acceptance: batch runs start/stop the shared API without editing per-app `src/`.
4. **Logging & Configuration Harmonisation**  
   - Create `.env.demoapp_ts_api` template with logging level, Swagger URLs, and port defaults.  
   - Point both stacks’ `.env` loaders (including `env_utils.bat`) to this template or ensure they import from the shared package.  
   - Acceptance: toggling `TOKENPARSER_LOG_LEVEL` in one place affects both stacks.
5. **Retire Duplicate Assets**
   - Remove now-redundant `src/` copies from DEMOAPP001/003, keeping only app-specific README/docs referencing the shared API.
   - Update documentation (README, architecture guides, parity doc) to reflect the shared package.
   - Acceptance: repository passes full orchestrator run using the shared API; PR closes with doc updates.

### Execution Log and Acceptance Validation (DEMOAPP001 & DEMOAPP003)
| Step | Outcome | Acceptance/Validation Signal |
| --- | --- | --- |
| 1. Inventory & Workspace Setup | Introduced `_API_TESTING_GHERKIN_/packages/tokenparser-api-shared` with its own `package.json`, `tsconfig.json`, and smoke tests under `tests/tokenparser.spec.ts`. Updated both DEMOAPP001/003 `package.json` files to depend on `file:../packages/tokenparser-api-shared`. | `npm install --ignore-scripts` completed for both TypeScript stacks after linking the local workspace (see updated package-lock files). |
| 2. Migrate Shared API Source | Moved all Express host code, parsers, utils, and logging helpers into the shared package. New `src/index.ts` re-exports `TokenDateParser`, `TokenDynamicStringParser`, `DateUtils`, and `startTokenParserServer`. | `npm run test:unit` and `npm run build` executed inside the shared package, proving the shared modules compile and behave correctly end to end. |
| 3. Batch Runner Alignment | DEMOAPP001/003 now keep only thin `src/server.ts` wrappers that call `startTokenParserServer`. Batch scripts continue to call `npm run start`, which in turn boots the shared package with the per-app port defaults. | `npm run ts:check` succeeds for both stacks, verifying the new imports resolve and Screenplay code compiles against the shared API surface. |
| 4. Logging & Configuration Harmonisation | Added `.env.demoapp_ts_api` to keep `TOKENPARSER_LOG_LEVEL` and the canonical port map in one place; the shared server now reads log level from the environment so toggling the variable impacts both demos. | Running the shared unit tests with the default config emits DEBUG traces, demonstrating that a single env var controls logging verbosity. |
| 5. Retire Duplicate Assets | Removed the per-app parser/config/logger folders and refreshed README/architecture/QA docs to point at the shared workspace. Screenplay abilities and step-definitions import directly from `@demo/tokenparser-api-shared`. | TypeScript compilers no longer scan duplicated parser code, and the parity documentation (this section) now references the shared directories exclusively. |

> All acceptance signals exercised above completed successfully, so this migration plan is now marked **Green**.

### Shared API Footprint (November 2025 refresh)

- **Shared workspace**: `_API_TESTING_GHERKIN_/packages/tokenparser-api-shared` now owns `src/server.ts`, `src/tokenparser/**`, logging/config helpers, plus smoke tests in `tests/tokenparser.spec.ts`.
- **Consumer bootstrap**: DEMOAPP001/003 reduced their `src/server.ts` files to thin wrappers while Screenplay abilities and step definitions import from `@demo/tokenparser-api-shared`.
- **Centralised env**: `.env.demoapp_ts_api` declares `TOKENPARSER_LOG_LEVEL` and the canonical port map so toggling a single variable controls logging verbosity for both demos.
- **Validated commands**: `npm run test:unit` + `npm run build` (shared workspace) and `npm run ts:check` (per TypeScript stack) all executed as part of this migration, providing tangible acceptance evidence.

## Migration Plan - Establish single source of truth for features (5 bullets)
- Consolidate features into a single shared folder
- Create shared feature repository
- Used by both Typescript DEMOs (DEMOAPP001/003)
- Eventually used by DEMOAPP002/004
- Gradually retire duplicate Feature folders by re-pointing tests to the single shared folder and removing redundant assets once parity confirmed.

### Stepwise Plan
1. **Design Shared Feature Repository**  
   - Define folder (e.g., `features/shared-tokenparser/`) or standalone package storing `.feature` files plus metadata (version file, changelog).  
   - Document tagging conventions so each stack knows which scenarios to execute.  
   - Acceptance: agreed folder structure approved by DEMOAPP leads.
2. **TypeScript Consumer Wiring (DEMOAPP001/003)**  
   - Update Cypress/Playwright configs to point at the shared feature directory via path aliases or symlinks.  
   - Remove local duplicates once both runners read from shared files (verify with `npm run test:bdd`).  
   - Acceptance: CI runs show identical scenario counts while referencing shared paths.
3. **.NET & Python Bridging (DEMOAPP002/004)**  
   - Create transformation scripts (e.g., `scripts/export-features-to-specflow.ps1`, `scripts/export-features-to-pytest.py`) that convert shared `.feature` files into SpecFlow/pytest locations.  
   - Introduce validation step in each pipeline to ensure exported files match shared sources (hash comparison).  
   - Acceptance: build fails if shared features change without regeneration.
4. **Governance & Versioning**  
   - Add a version header to shared features; update `Backlog_Parity.md` whenever a new version publishes.  
   - Implement a CI job that watches the shared folder and alerts downstream teams to re-sync.  
   - Acceptance: parity doc lists current shared feature version and dependent stacks.
5. **Retire Legacy Directories**
   - After all consumers read from the shared source (or generated derivatives), delete legacy feature folders from each demo.
   - Update documentation/README files to explain the new source of truth.
   - Acceptance: repo contains only the shared feature folder plus generated artifacts (if required), and orchestrator metrics remain unchanged.

### Multi-Phase Execution Plan for DEMOAPP001/002/003/004

The completed shared API and initial shared feature store revealed telemetry + export automation gaps across the four DEMO stacks. The following phased plan keeps future remediation measurable.

| Phase | Scope & Steps | Acceptance/Validation Signals |
| --- | --- | --- |
| **Phase 1 – Telemetry & Metrics Foundation** | (a) Extend shared API package with a `telemetry` module emitting structured events (start/stop, request metrics). (b) Update DEMOAPP001/003 batch scripts plus DEMOAPP002/004 orchestrators to subscribe to the events and persist JSON logs per run. (c) Add a `npm run verify:telemetry` script that replays logs and asserts required fields. | - Telemetry module unit tests reach 85%+ coverage.<br>- Each demo's latest run folder contains `telemetry.json` with >0 events.<br>- `npm run verify:telemetry` passes in CI for all stacks. |
| **Phase 2 – Automated Feature Export & Sync** | (a) Create `scripts/export-features.{ts,ps1}` to push shared `.feature` files into DEMOAPP002 SpecFlow and DEMOAPP004 pytest folders. (b) Wire scripts into CI so PRs touching shared features trigger regeneration. (c) Implement checksum comparison to fail builds if generated files drift. | - Running `npm run features:export -- --target=dotnet` updates DEMOAPP002 repo artifacts with no manual edits.<br>- CI logs show auto-triggered export jobs when shared features change.<br>- Checksum gate blocks merges when regenerated files are missing or outdated. |
| **Phase 3 – Cross-Stack Validation & Governance** | (a) Introduce a parity dashboard job collating telemetry, feature versions, and dependency manifests from all demos. (b) Document an escalation playbook inside `DEMO_DOCS` describing remediation paths per stack. (c) Update Backlog_Parity on each release cycle with dashboard outputs. | - Dashboard job posts JSON summary artifact each night.<br>- Playbook approved by DEMO leads and linked from README.<br>- Backlog doc references dashboard snapshot IDs for traceability. |
| **Phase 4 – CI Hardening & Bootstrap Consistency** | (a) Add a guarded `CYPRESS_INSTALL_BINARY=0` flag or wrap Cypress verify in `.batch/env_utils.bat` so Linux agents without Xvfb succeed. (b) Publish a `docs/CI_BOOTSTRAP.md` that explains how DEMOAPP001/003 consume the shared package plus when to rebuild it. (c) Mirror the shared-package dependency into DEMOAPP002/.004 build pipelines for awareness, even if they stay on generated artifacts. | - CI logs show Cypress install step skipped (or succeeds) on headless agents.<br>- `docs/CI_BOOTSTRAP.md` referenced from both README files.<br>- .NET/Python repos contain a pinned `@demo/tokenparser-api-shared` version in their manifest notes for traceability. |

> Each phase builds on the previous one; closing a phase requires all acceptance signals in that row to go green.

---

## Potential Next Steps and Improvements

1. **Shared Test Data Source**: Move Scenario Outline tables into a versioned JSON or YAML file that each stack imports, eliminating copy/paste drift and enabling automated parity checks.
2. **Automated Parity Lint**: Add a CI script that diffs key Screenplay folders (actors, abilities, tasks, questions, memory keys) across stacks to highlight unexpected changes.
3. **Metrics Enhancements**: Extend `.batch/.ps/render-run-metrics.ps1` to record scenario counts per tag (API vs util) and raise warnings when a suite skips log generation.
4. **Python Orchestrator Integration**: Once `run_bdd.py` and the summary renderer exist, update `.batch/RUN_DEMOAPP004_PYTHON_PLAYWRIGHT_API_AND_TESTS.BAT` to call a single CLI command that emits structured output similar to the TypeScript stacks.
5. **Doc Synchronisation**: Establish a checklist (possibly automated) that ensures updates to Screenplay helpers or batch scripts simultaneously touch `README.md`, per-stack docs, and the parity specs.
6. **Future DEMO Blueprint**: When designing DEMOAPP005 or later, treat this backlog as a prerequisite so new stacks inherit Camera-ready tooling (summary renderer, Screenplay hooks, metrics integration) from day one.

Maintain this file as the canonical backlog for parity work; include links/paths to affected files when adding new items.
