# QA Strategy – DEMOAPP004

## Guiding Principles
- **Risk-Based Testing (ISTQB)** – Tag scenarios by risk level (`@high_risk` for complex tokens) so CI pipelines can prioritise them.
- **Traceability** – Maintain `TRACEABILITY.md` linking contract requirements → feature files → batch logs.
- **Early Defect Detection** – Parser util suites run before API suites in `RUN_DEMOAPP004_PYTHON_PLAYWRIGHT_API_AND_TESTS.BAT`, ensuring failures surface before network calls.
- **Defect Clustering Awareness** – Run metrics (`run_metrics_<UTC>.md`) highlight util/API failures separately, giving rapid insight into hotspots.
- **Continuous Feedback** – Playwright traces + JSON metrics attach to CI artefacts for deterministic diagnostics.

## Best Practices
1. **Environment Control** – Use `.env` defaults (port 3002, log level `debug`). Batch scripts hydrate these via `env_utils.bat`.
2. **Data Management** – Scenario outlines pull shared token data; future work will centralise these tables in JSON to keep all stacks aligned.
3. **Screenplay Consistency** – Actors always attach `CallAnApi` + `UseTokenParsers` abilities, mirroring DEMOAPP001 semantics.
4. **Fail-Fast** – Util fixtures assert boolean success explicitly; API suites assert response bodies via reusable questions.
5. **Metrics & Reporting** – `tooling/run_bdd.py` (upcoming) will emit JSON consumed by the orchestrator so suite-level exit codes stay consistent with other demos.
