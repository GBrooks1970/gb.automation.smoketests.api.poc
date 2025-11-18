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

## Migration Plan - Establish single source of truth for features (5 bullets)
- Consolidate features into a single shared folder
- Create shared feature repository
- Used by both Typescript DEMOs (DEMOAPP001/003)
- Eventually used by DEMOAPP002/004
- Gradually retire duplicate Feature folders by re-pointing tests to the single shared folder and removing redundant assets once parity confirmed.

## Potential Next Steps and Improvements

1. **Shared Test Data Source**: Move Scenario Outline tables into a versioned JSON or YAML file that each stack imports, eliminating copy/paste drift and enabling automated parity checks.
2. **Automated Parity Lint**: Add a CI script that diffs key Screenplay folders (actors, abilities, tasks, questions, memory keys) across stacks to highlight unexpected changes.
3. **Metrics Enhancements**: Extend `.batch/.ps/render-run-metrics.ps1` to record scenario counts per tag (API vs util) and raise warnings when a suite skips log generation.
4. **Python Orchestrator Integration**: Once `run_bdd.py` and the summary renderer exist, update `.batch/RUN_DEMOAPP004_PYTHON_PLAYWRIGHT_API_AND_TESTS.BAT` to call a single CLI command that emits structured output similar to the TypeScript stacks.
5. **Doc Synchronisation**: Establish a checklist (possibly automated) that ensures updates to Screenplay helpers or batch scripts simultaneously touch `README.md`, per-stack docs, and the parity specs.
6. **Future DEMO Blueprint**: When designing DEMOAPP005 or later, treat this backlog as a prerequisite so new stacks inherit Camera-ready tooling (summary renderer, Screenplay hooks, metrics integration) from day one.

Maintain this file as the canonical backlog for parity work; include links/paths to affected files when adding new items.
