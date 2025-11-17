# Backlog Parity Notes - Version 1 (17/11/25)

This backlog captures outstanding work needed to keep all DEMOAPP stacks in parity. Update the version when items are added, reprioritised, or closed.

---

## Outstanding Issues and Recommended Refactors

1. **Feature Table Coverage**: DEMOAPP004 util and API feature files include only a subset of the rows used in DEMOAPP001/003/002. Port the full set of date and dynamic string Scenario Outlines to guarantee identical coverage.
2. **Python Tooling Hooks**: `tooling/run_bdd.py`, `tooling/summary_renderer.py`, and `features/step_definitions/world.py` are placeholders. Finish the CLI wrapper, summary renderer, and Screenplay hook so pytest-bdd can plug into the orchestrator like the TypeScript stacks.
3. **Batch API Warm-Up**: `.batch/RUN_ALL_APIS_AND_SWAGGER.BAT` currently launches the TypeScript and .NET APIs only. Extend it to include the FastAPI host so all stacks are exercised during contract reviews.
4. **README Quick-Start Drift**: Ensure all stack readmes reference the correct install commands (`pip install -e .[dev]` for Python, etc.) and remove outdated references to non-existent files (for example, `requirements.txt`).
5. **C# Dynamic String Randomness**: `TokenParserAPI/utils/TokenDynamicStringParser.cs` still uses a static `Random`. Replace it with a thread-safe generator to avoid collisions under load.
6. **Contract Documentation**: `API Testing POC/DEMO_DOCS/tokenparser_api_contract.md` only lists the first three demo hosts. Update it to mention the FastAPI stack so compliance checks include every runtime.

---

## Potential Next Steps and Improvements

1. **Shared Test Data Source**: Move Scenario Outline tables into a versioned JSON or YAML file that each stack imports, eliminating copy/paste drift and enabling automated parity checks.
2. **Automated Parity Lint**: Add a CI script that diffs key Screenplay folders (actors, abilities, tasks, questions, memory keys) across stacks to highlight unexpected changes.
3. **Metrics Enhancements**: Extend `.batch/.ps/render-run-metrics.ps1` to record scenario counts per tag (API vs util) and raise warnings when a suite skips log generation.
4. **Python Orchestrator Integration**: Once `run_bdd.py` and the summary renderer exist, update `.batch/RUN_DEMOAPP004_PYTHON_PLAYWRIGHT_API_AND_TESTS.BAT` to call a single CLI command that emits structured output similar to the TypeScript stacks.
5. **Doc Synchronisation**: Establish a checklist (possibly automated) that ensures updates to Screenplay helpers or batch scripts simultaneously touch `README.md`, per-stack docs, and the parity specs.
6. **Future DEMO Blueprint**: When designing DEMOAPP005 or later, treat this backlog as a prerequisite so new stacks inherit Camera-ready tooling (summary renderer, Screenplay hooks, metrics integration) from day one.

Maintain this file as the canonical backlog for parity work; include links/paths to affected files when adding new items.
