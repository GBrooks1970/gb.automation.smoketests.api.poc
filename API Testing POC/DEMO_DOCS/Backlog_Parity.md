# Backlog Parity Notes - Version 1 (17/11/25)

This backlog captures outstanding work needed to keep all DEMOAPP stacks in parity. Update the version when items are added, reprioritised, or closed.

---

## Outstanding Issues and Recommended Refactors

_None at this time. Track new findings here as they arise._

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
   - _Status 18/11/25_: shared package (`packages/tokenparser-api-shared`) now contains the Express host + parsers; DEMOAPP001/003 consume it via re-export shims and workspace paths.
3. **Batch Runner Alignment**  
    - Introduce a single start script (e.g., `npm run start:shared -- --port=<PORT>`) inside the shared package.  
    - Update `.batch/RUN_DEMOAPP001_*.BAT` and `.batch/RUN_DEMOAPP003_*.BAT` to call the shared script, passing `PORT=3000/3001` via env vars.  
    - Acceptance: batch runs start/stop the shared API without editing per-app `src/`.  
    - _Status 18/11/25_: both batch runners now call `node packages/tokenparser-api-shared/dist/cli/start.js` with the desired port/label and capture PIDs for teardown.
4. **Logging & Configuration Harmonisation**  
   - Create `.env.demoapp_ts_api` template with logging level, Swagger URLs, and port defaults.  
   - Point both stacks’ `.env` loaders (including `env_utils.bat`) to this template or ensure they import from the shared package.  
   - Acceptance: toggling `TOKENPARSER_LOG_LEVEL` in one place affects both stacks.
5. **Retire Duplicate Assets**  
   - Remove now-redundant `src/` copies from DEMOAPP001/003, keeping only app-specific README/docs referencing the shared API.  
   - Update documentation (README, architecture guides, parity doc) to reflect the shared package.  
   - Acceptance: repository passes full orchestrator run using the shared API; PR closes with doc updates.

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

---

## Potential Next Steps and Improvements

1. **Shared Test Data Source**: Move Scenario Outline tables into a versioned JSON or YAML file that each stack imports, eliminating copy/paste drift and enabling automated parity checks.
2. **Automated Parity Lint**: Add a CI script that diffs key Screenplay folders (actors, abilities, tasks, questions, memory keys) across stacks to highlight unexpected changes.
3. **Metrics Enhancements**: Extend `.batch/.ps/render-run-metrics.ps1` to record scenario counts per tag (API vs util) and raise warnings when a suite skips log generation.
4. **Python Orchestrator Integration**: Once `run_bdd.py` and the summary renderer exist, update `.batch/RUN_DEMOAPP004_PYTHON_PLAYWRIGHT_API_AND_TESTS.BAT` to call a single CLI command that emits structured output similar to the TypeScript stacks.
5. **Doc Synchronisation**: Establish a checklist (possibly automated) that ensures updates to Screenplay helpers or batch scripts simultaneously touch `README.md`, per-stack docs, and the parity specs.
6. **Future DEMO Blueprint**: When designing DEMOAPP005 or later, treat this backlog as a prerequisite so new stacks inherit Camera-ready tooling (summary renderer, Screenplay hooks, metrics integration) from day one.

Maintain this file as the canonical backlog for parity work; include links/paths to affected files when adding new items.
