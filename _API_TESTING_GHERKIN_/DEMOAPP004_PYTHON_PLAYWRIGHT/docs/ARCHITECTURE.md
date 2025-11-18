# DEMOAPP004 – FastAPI + Playwright Architecture Guide

**Version 2 – 18/11/25**

## 1. Overview
- **Stack**: FastAPI host (`src/server.py`) + pytest-bdd with Playwright request fixtures, all wrapped in Screenplay abstractions.
- **Goal**: Python parity project matching the behaviour, feature data, and tooling of the TypeScript stacks.
- **Automation Entrypoints**: `RUN_API.bat`, `RUN_TESTS.bat`, `.batch/RUN_DEMOAPP004_PYTHON_PLAYWRIGHT_API_AND_TESTS.BAT`, and the global orchestrator.

## 2. Components
| Component | Location | Notes |
| --- | --- | --- |
| FastAPI application | `src/server.py` | Includes `/alive`, `/parse-date-token`, `/parse-dynamic-string-token`, Swagger at `/docs`. |
| Token parsers | `src/tokenparser/` | Mirrors TypeScript logic with shared formatting helpers. |
| pytest-bdd features | `features/api/*.feature`, `features/util/*.feature` | Scenario Outlines copied from DEMOAPP001. |
| Screenplay runtime | `screenplay/` | Actors, abilities, tasks, questions, memory keys implemented in Python. |
| Tooling | `tooling/run_bdd.py`, `tooling/summary_renderer.py` | CLI entry and reporting for batch scripts. |

## 3. Execution Flow
1. `.batch/RUN_DEMOAPP004_PYTHON_PLAYWRIGHT_API_AND_TESTS.BAT` loads `.env`, executes `python -m pytest -m util`, checks port 3002, launches FastAPI via `python -m src.server`, opens Swagger (`/docs`), then runs `python -m pytest -m api`.
2. Tests leverage Screenplay fixtures defined in `features/step_definitions/world.py` and `screenplay/core`.
3. Logs stream to `.results/demoapp004_python_playwright_<UTC>.txt` (API) and `_util_<UTC>.txt` (util). `tooling/summary_renderer.py` can produce Markdown/ASCII summaries if needed.

## 4. Directory Layout
```
DEMOAPP004_PYTHON_PLAYWRIGHT
├─ docs/
├─ features/
│  ├─ api/
│  └─ util/
├─ screenplay/
│  ├─ abilities/
│  ├─ tasks/
│  ├─ questions/
│  └─ support/
├─ src/
│  ├─ server.py
│  └─ tokenparser/
├─ tooling/
│  ├─ run_bdd.py
│  └─ summary_renderer.py
├─ RUN_API.bat / RUN_TESTS.bat
├─ requirements (pyproject / setup.cfg)
└─ .results/
```

## 5. Environment & Tooling
- **Python Env**: `.venv` recommended; install via `pip install -e .[dev]` and `python -m playwright install`.
- **Configuration**: `.env` defines `API_BASE_URL`, port, and logging options. Batch scripts hydrate `.env` automatically.
- **Logging**: `logging.config.dictConfig` defines shared levels; `TOKENPARSER_LOG_LEVEL` environment variable maps to Python logger names for parity with TS/.NET stacks.
- **CLI Runner**: `tooling/run_bdd.py` loads `.env`, ensures Playwright browsers exist, runs pytest with tags, and prints summary lines recognized by the repo orchestrator.

## 6. Operational Notes
- Keep feature tables synchronised with DEMOAPP001. When data changes, update `features/**` plus this doc, and note it in `API Testing POC/DEMO_DOCS/Backlog_Parity.md`.
- Playwright for Python requires `python -m playwright install`; `RUN_TESTS.bat` should be executed after the virtual environment is activated to avoid CLI confusion with the .NET global tool.
- `.batch/RUN_ALL_APIS_AND_SWAGGER.BAT` now launches FastAPI so contract reviewers see all four stacks concurrently.
- Metrics from `.batch/RUN_ALL_API_AND_TESTS.BAT` reference the `Playwright PY` label; ensure log formats remain parseable by `.batch/.ps/render-run-metrics.ps1`.

## 7. References
- `_API_TESTING_GHERKIN_/DEMOAPP004_PYTHON_PLAYWRIGHT/README.md` for quick-start and tooling caveats.
- QA Strategy & Screenplay Guide (this folder) for testing specifics.
- Shared project docs: `API Testing POC/DEMO_DOCS/batch_runner_design.md`, `screenplay_parity_demoapps.md`, and `tokenparser_api_contract.md`.
