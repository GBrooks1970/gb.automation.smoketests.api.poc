# Backlog Parity Notes - Version 3 (2025-11-18)

This backlog tracks the remaining work required to keep all DEMOAPP stacks aligned after consolidating the shared TypeScript API package. Update the version whenever execution status, validation evidence, or parity plans change.

---

## Outstanding Issues and Recommended Refactors

1. **Telemetry + log governance gaps** – DEMOAPP002/004 still lack structured telemetry for API + feature runs. Even though DEMOAPP001/003 now emit consistent logs via the shared `.env.demoapp_ts_api`, the downstream stacks cannot yet consume those signals.
2. **Automated feature export + sync** – SpecFlow (DEMOAPP002) and pytest (DEMOAPP004) still rely on manual exports from the shared feature workspace. Automated exporters plus CI gates are needed to keep all stacks honest.
3. **Cross-platform env automation** – Windows batch runners now hydrate `PORT`, `API_BASE_URL`, and `TOKENPARSER_LOG_LEVEL` from the new `.env.demoapp_ts_api`, but Linux developers still have to export `API_BASE_URL` manually before BDD runs. A portable helper (shell + PowerShell) remains on the backlog.

---

## Shared `.env.demoapp_ts_api` template

- Location: `_API_TESTING_GHERKIN_/.env.demoapp_ts_api` defines the canonical logging level and documented port/base URL defaults for DEMOAPP001/003. 【F:_API_TESTING_GHERKIN_/.env.demoapp_ts_api†L1-L9】
- Batch helpers automatically import it so toggling `TOKENPARSER_LOG_LEVEL` in this single file applies to both TypeScript demo stacks without editing per-app `.env` files. 【F:.batch/env_utils.bat†L7-L36】
- The shared API package now calls `ensureSharedEnvLoaded` before building its logger, so local `npm run start` sessions also respect the template (see the `[dotenv@...]` log line in both demo servers). 【F:_API_TESTING_GHERKIN_/packages/tokenparser-api-shared/src/config/shared-env.ts†L1-L32】【61961e†L1-L6】【d088fc†L1-L6】

---

## Validation Evidence (DEMOAPP001 & DEMOAPP003)

- Shared package build: `npm run build` in `_API_TESTING_GHERKIN_/packages/tokenparser-api-shared` confirms the workspace compiles cleanly after the env-loader changes. 【ad40ee†L1-L7】
- DEMOAPP001 validation: `npm run ts:check` plus `API_BASE_URL=http://localhost:3000 npm run test:bdd` exercised both util + API specs end-to-end (55 scenarios passing). 【f14bff†L1-L7】【d150ba†L1-L44】
- DEMOAPP003 validation: `npm run ts:check` plus `API_BASE_URL=http://localhost:3001 npm run test:bdd` covered the Playwright + Cucumber stack (55 scenarios passing). 【9950d7†L1-L7】【d92c9a†L1-L60】

All commands were run against the freshly started shared API servers to validate the acceptance signals below.

---

## Migration Plan - ONE Typescript API (5 bullets)
- Consolidate DEMOAPP001/003 server code into a single shared Express/TypeScript API package published via npm workspace.
- Update both stacks' batch runners to call the shared API start script, controlled by env var port selection (3000 vs 3001).
- Refactor parser modules into shared workspace references; adjust tsconfig path mapping for both projects.
- Harmonize logging + configuration files so tests read from a single `.env.demoapp_ts_api` template.
- Gradually retire duplicate API folders by re-pointing tests to the shared package and removing redundant assets once parity confirmed.

### Stepwise Plan

| Step | Outcome | Acceptance Signal |
| --- | --- | --- |
| 1. **Inventory & Workspace Setup** | Workspace package `_API_TESTING_GHERKIN_/packages/tokenparser-api-shared` builds successfully and exposes parser-only entry points for all consumers. | `npm run build` completes with no warnings, proving the shared package compiles independently. 【ad40ee†L1-L7】 |
| 2. **Migrate Shared API Source** | DEMOAPP001/003 `src/server.ts` files now just delegate to `startTokenParserServer`, while all parser logic lives in the shared package (compiled into `dist/`). | TypeScript entry points only import `@demoapps/tokenparser-api-shared`; no local parser copies remain. 【F:_API_TESTING_GHERKIN_/DEMOAPP001_TYPESCRIPT_CYPRESS/src/server.ts†L1-L12】【F:_API_TESTING_GHERKIN_/DEMOAPP003_TYPESCRIPT_PLAYWRIGHT/src/server.ts†L1-L12】 |
| 3. **Batch Runner Alignment** | `.batch/RUN_DEMOAPP00x_*.BAT` scripts all call `env_utils.bat` to hydrate ports/base URLs before invoking `npm run start`, so API lifecycle management is centralized. | Script diffs show both DEMOAPP001 and DEMOAPP003 runners delegate to shared helpers, keeping start/stop logic identical. 【F:.batch/RUN_DEMOAPP001_TYPESCRIPT_CYPRESS_API_AND_TESTS.BAT†L1-L75】【F:.batch/RUN_DEMOAPP003_TYPESCRIPT_PLAYWRIGHT_API_AND_TESTS.BAT†L1-L74】 |
| 4. **Logging & Configuration Harmonisation** | The new `.env.demoapp_ts_api` template plus `ensureSharedEnvLoaded` allow a single log-level toggle to affect both demo stacks, and batch helpers now load the same values automatically. | Shared env loader implementation and `[dotenv@...]` traces confirm the file is read during each `npm run start`, satisfying the “one template” requirement. 【F:_API_TESTING_GHERKIN_/packages/tokenparser-api-shared/src/config/shared-env.ts†L1-L32】【61961e†L1-L6】【d088fc†L1-L6】 |
| 5. **Retire Duplicate Assets** | Only the minimal entrypoint + ambient type definitions remain inside each TypeScript demo; all parsers, middleware, and config objects resolve from the shared package. | Full Cypress and Playwright BDD runs hit the shared API package exclusively, keeping orchestrator parity while all specs pass (55/55 scenarios each). 【F:_API_TESTING_GHERKIN_/DEMOAPP001_TYPESCRIPT_CYPRESS/src/server.ts†L1-L12】【d150ba†L1-L44】【d92c9a†L1-L60】 |

> All acceptance signals were re-run after the env harmonisation work, and both demo suites remain **Green**.

---

## Migration Plan - Establish single source of truth for features (5 bullets)
- Consolidate features into a single shared folder
- Create shared feature repository
- Used by both TypeScript DEMOs (DEMOAPP001/003)
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

---

## Multi-Phase Execution Plan for DEMOAPP001/002/003/004

| Phase | Scope & Steps | Acceptance/Validation Signals |
| --- | --- | --- |
| **Phase 1 – Telemetry + Env Automation Foundation** | (a) Extend the shared API package with a `telemetry` module that emits structured run events consumed by all demo orchestrators. (b) Provide cross-platform helpers (`scripts/set-demoapp-env.{ps1,sh}`) so Linux/Windows runners read `.env.demoapp_ts_api` without manual `API_BASE_URL` exports. (c) Teach DEMOAPP002/004 pipelines to ingest the same template for future-proof logging parity. | - New telemetry unit tests cover >85% of the helper module.<br>- Running `npm run verify:telemetry` in each stack uploads a JSON artifact per suite.<br>- Local `npm run test:bdd` (Linux) succeeds without manually exporting `API_BASE_URL`, proving the helper loads the shared template automatically. |
| **Phase 2 – Automated Feature Export & Sync** | (a) Implement `npm run features:export -- --target=dotnet|python` that copies shared `.feature` files into DEMOAPP002 SpecFlow + DEMOAPP004 pytest folders. (b) Wire the export command into CI so any PR touching the shared features triggers regeneration. (c) Add checksum comparison gates to stop merges when generated files drift from source. | - Export scripts leave no git diffs when re-run twice in succession.<br>- CI logs show auto-triggered export jobs whenever shared features change.<br>- `npm run features:verify` fails if generated files fall out of sync, blocking the merge until regen occurs. |
| **Phase 3 – Cross-Stack Governance & Drift Detection** | (a) Build a nightly parity dashboard job that collates telemetry, feature versions, Screenplay helpers, and dependency manifests from all demos. (b) Document an escalation playbook inside `API Testing POC/DEMO_DOCS` describing remediation paths per stack. (c) Update `Backlog_Parity.md` on each release cycle with the latest dashboard snapshot ID so future teams can trace parity state quickly. | - Dashboard job publishes a JSON artifact with metrics per stack and stores it alongside build logs.<br>- DEMO leads sign off on the escalation playbook and link it from each README.<br>- Each Backlog Parity update references the latest snapshot ID so auditors can trace exactly which data set informed the status. |

> Each phase builds on the previous one; do not mark a phase green until every acceptance signal in that row has gone green.

---

## Potential Next Steps and Improvements

1. **Shared Test Data Source**: Move Scenario Outline tables into a versioned JSON or YAML file that each stack imports, eliminating copy/paste drift and enabling automated parity checks.
2. **Automated Parity Lint**: Add a CI script that diffs key Screenplay folders (actors, abilities, tasks, questions, memory keys) across stacks to highlight unexpected changes.
3. **Metrics Enhancements**: Extend `.batch/.ps/render-run-metrics.ps1` to record scenario counts per tag (API vs util) and raise warnings when a suite skips log generation.
4. **Python Orchestrator Integration**: Once `run_bdd.py` and the summary renderer exist, update `.batch/RUN_DEMOAPP004_PYTHON_PLAYWRIGHT_API_AND_TESTS.BAT` to call a single CLI command that emits structured output similar to the TypeScript stacks.
5. **Doc Synchronisation**: Establish a checklist (possibly automated) that ensures updates to Screenplay helpers or batch scripts simultaneously touch `README.md`, per-stack docs, and the parity specs.
6. **Future DEMO Blueprint**: When designing DEMOAPP005 or later, treat this backlog as a prerequisite so new stacks inherit camera-ready tooling (summary renderer, Screenplay hooks, metrics integration) from day one.

Maintain this file as the canonical backlog for parity work; include links/paths to affected files when adding new items.
