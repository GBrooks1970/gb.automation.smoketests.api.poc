# QA Strategy – DEMOAPP004 (Python + Playwright)

**Version 2 – 18/11/25**

## 1. Objectives
1. Provide a Python reference stack that matches TypeScript feature coverage and Screenplay semantics.
2. Ensure FastAPI host + pytest-bdd tooling integrate cleanly with repository batch scripts and metrics.
3. Maintain deterministic util/API results so orchestrator output remains trustworthy.

## 2. Test Layers
| Layer | Scope | Tooling |
| --- | --- | --- |
| Static analysis | Formatting & linting | `ruff check`, `black --check`, `mypy` (where applicable). |
| Util Scenarios | Parser-only validation | `pytest -m util` driven by Screenplay tasks. |
| API Scenarios | FastAPI endpoints | `pytest -m api` using Playwright `APIRequestContext`. |
| Integration | API lifecycle + Swagger | `.batch/RUN_DEMOAPP004_PYTHON_PLAYWRIGHT_API_AND_TESTS.BAT` and `.batch/RUN_ALL_APIS_AND_SWAGGER.BAT`. |
| Cross-stack Regression | All stacks sequentially | `.batch/RUN_ALL_API_AND_TESTS.BAT`. |

## 3. Execution Workflow
1. Create/activate `.venv`.
2. `pip install -e .[dev]`.
3. `python -m playwright install`.
4. `ruff check && black --check && mypy src screenplay`.
5. `pytest -m util`.
6. `pytest -m api`.
7. For parity validation run `RUN_API.bat`, `RUN_TESTS.bat`, or the `.batch` orchestrator.

## 4. Metrics & Reporting
- Util/API runs write logs to `.results/demoapp004_python_playwright_{util|api}_<UTC>.txt`.
- `.batch/RUN_ALL_API_AND_TESTS.BAT` labels this stack as `Playwright PY` and records counts (15 tests as of 18/11/25).
- `tooling/summary_renderer.py` can render Markdown tables for documentation; extend it when log formats change.

## 5. Risks & Mitigations
| Risk | Mitigation |
| --- | --- |
| Virtual environment not activated | BAT scripts emit warnings; always run commands via `.venv\Scripts\activate`. |
| Playwright CLI confusion (`playwright install` vs `python -m playwright install`) | README + QA strategy emphasise the Python module invocation to avoid .NET CLI conflicts. |
| Feature drift | Track updates in `API Testing POC/DEMO_DOCS/Backlog_Parity.md` and re-run parity validation after changes. |
| Logging verbosity mismatch | Use `TOKENPARSER_LOG_LEVEL` env var to sync with other stacks. |

## 6. Continuous Improvement
1. Add pytest unit tests for `src/tokenparser` modules to catch regressions earlier.
2. Emit Playwright trace artifacts for failing API scenarios.
3. Integrate coverage reporting (`coverage.py`) for parser modules and share results in `.results`.
4. Automate parity checks by diffing feature YAML/JSON manifests.
