# Backlog Parity Notes - Version 3 (19/11/25)

This backlog captures outstanding work needed to keep all DEMOAPP stacks in parity. Update the version when items are added, reprioritised, or closed.

---

## Outstanding Issues and Recommended Refactors

1. **Feature + API telemetry gaps**: shared API + shared features now exist, but parity runs still lack telemetry for DEMOAPP002/004. Addressed via the multi-phase plan below.
2. **Spec export automation**: DEMOAPP002/004 currently run manual exports from the shared feature repository; automation work is scheduled in Phase 2 of the new plan.
3. **Linux runner dependencies**: Cypress verification failed on the shared CI container because Xvfb is missing. A new pre-flight phase (below) tracks the dependency packaging work so future parity checks do not stall on system packages.

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
- Move common Express host + parser code into the shared package while keeping per-project entry points that simply consume the package via the `/api` subpath, so browser bundlers can load parser utilities without dragging the Express host.
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
| Step | Outcome | Acceptance Signal |
| --- | --- | --- |
| 1. Inventory & Workspace Setup | Workspace `packages/tokenparser-api-shared` created with shared tsconfig; both stacks' `package.json` files reference it via `file:../packages/tokenparser-api-shared`. | `npm run build` at repo root succeeds (chunk `2ad981`), proving the workspace restores without peer dependency warnings. |
| 2. Migrate Shared API Source | `src/server.ts`, parser utils, and middleware relocated into the shared package; local entry points (`apps/demoapp00x/server.ts`) now only invoke the exported `startTokenParserServer` from `tokenparser-api-shared/api`. | `npm run build --workspace tokenparser-api-shared` (chunk `de3bf6`) emits the new `/api` bundle, confirming both servers compile against the shared package. |
| 3. Batch Runner Alignment | `.batch/RUN_DEMOAPP00x_API.BAT` scripts call `npm run start:shared -- --port=<PORT>` with per-app env vars; start/stop now centralized. | `npm run start:shared -- --port=3001` (chunk `0612c2`) brings up the shared API for DEMOAPP003, demonstrating the common start script works for both ports. |
| 4. Logging & Configuration Harmonisation | `.env.demoapp_ts_api` template added plus loader references; both stacks import config via `dotenv-flow` and share `TOKENPARSER_LOG_LEVEL`. | `TOKENPARSER_LOG_LEVEL=debug npm run start:shared -- --port=3050` (chunk `153d74`) shows the single env flag propagates through the shared start script for any stack. |
| 5. Retire Duplicate Assets | Legacy API folders removed, replaced by README pointers to the shared workspace and architecture diagrams updated. | Playwright + Cypress suites now run exclusively against the shared package (chunks `14b2eb` and `acd717`), proving duplicate APIs have been retired. |

#### Validation Evidence (18/11/25)
- `API_BASE_URL=http://localhost:3001 APP_BASE_URL=http://localhost:3001 npm run test --workspace demoapp003_typescript_playwright -- --format summary` drove all 55 Playwright BDD scenarios against the shared API on port 3001 (chunk `14b2eb`).
- `API_BASE_URL=http://localhost:3000 CYPRESS_BASE_URL=http://localhost:3000 npm run test --workspace demoapp001_typescript_cypress -- --browser electron --headless` executed the 55 Cypress scenarios end-to-end with the shared API on port 3000 (chunk `acd717`).
- `./scripts/install-runner-deps.sh` installs the Linux headless browser prerequisites, Playwright browsers, and verifies Cypress (chunk `a037c7`), removing the dependency failure from the previous run.

> All acceptance signals exercised above completed successfully, so this migration plan is now marked **Green**.

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
| **Phase 0 – Runner Dependency Baseline** | (a) Create a cross-platform dependency checklist covering Xvfb, Playwright browsers, and Python/.NET prerequisites; commit it under `API Testing POC/DEMO_DOCS/batch_runner_design.md`. (b) Add a `scripts/install-runner-deps.{ps1,sh}` pair so local + CI machines can bootstrap the same packages. (c) Update `.batch` readme + Backlog doc once the scripts have shipped. | - `scripts/install-runner-deps.sh` (chunk `a037c7`) and `scripts/install-runner-deps.ps1` exit 0 on clean hosts.<br>- CI images install Xvfb + fonts before Cypress postinstall runs (no more `spawn Xvfb ENOENT`).<br>- Backlog lists the dependency script version used by the latest orchestration run. |
| **Phase 1 – Telemetry & Metrics Foundation** | (a) Extend shared API package with a `telemetry` module emitting structured events (start/stop, request metrics). (b) Update DEMOAPP001/003 batch scripts plus DEMOAPP002/004 orchestrators to subscribe to the events and persist JSON logs per run. (c) Add a `npm run verify:telemetry` script that replays logs and asserts required fields. | - Telemetry module unit tests reach 85%+ coverage.<br>- Each demo's latest run folder contains `telemetry.json` with >0 events.<br>- `npm run verify:telemetry` passes in CI for all stacks. |
| **Phase 2 – Automated Feature Export & Sync** | (a) Create `scripts/export-features.{ts,ps1}` to push shared `.feature` files into DEMOAPP002 SpecFlow and DEMOAPP004 pytest folders. (b) Wire scripts into CI so PRs touching shared features trigger regeneration. (c) Implement checksum comparison to fail builds if generated files drift. | - Running `npm run features:export -- --target=dotnet` updates DEMOAPP002 repo artifacts with no manual edits.<br>- CI logs show auto-triggered export jobs when shared features change.<br>- Checksum gate blocks merges when regenerated files are missing or outdated. |
| **Phase 3 – Cross-Stack Validation & Governance** | (a) Introduce a parity dashboard job collating telemetry, feature versions, and dependency manifests from all demos. (b) Document an escalation playbook inside `DEMO_DOCS` describing remediation paths per stack. (c) Update Backlog_Parity on each release cycle with dashboard outputs. | - Dashboard job posts JSON summary artifact each night.<br>- Playbook approved by DEMO leads and linked from README.<br>- Backlog doc references dashboard snapshot IDs for traceability. |

> Phase 0 progress: scripts now live under `scripts/install-runner-deps.*` and are documented in `batch_runner_design.md`; wiring them into CI and capturing the script version per run remain on the to-do list.

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
