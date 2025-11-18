# DEMOAPP004 - FastAPI + Playwright (Python) Screenplay

FastAPI host plus pytest-bdd suites that reuse the shared Token Parser contract. This stack mirrors the TypeScript projects and keeps Screenplay parity in Python.

---

## Layout

```
src/server.py           # FastAPI host, Swagger wiring, token parser endpoints
src/tokenparser/        # Python ports of the date and dynamic string parsers
screenplay/             # Actors, abilities, tasks, questions, memory helpers
features/               # pytest-bdd feature files tagged with @api / @util
tests/conftest.py       # pytest fixtures for actors, API request contexts, env
docs/                   # Architecture, QA strategy, Screenplay guide (to be updated)
tooling/                # run_bdd.py and summary renderer placeholders
```

---

## Environment

```powershell
cd _API_TESTING_GHERKIN_/DEMOAPP004_PYTHON_PLAYWRIGHT
python -m venv .venv
.\\.venv\\Scripts\\Activate
pip install -e .[dev]
python -m playwright install
```

`API_BASE_URL` and `PORT` values live in `.env.example`. The batch runner loads them using `env_utils.bat`.

---

## Running the API

```powershell
python -m src.server
```

Defaults:

- Base URL: `http://localhost:3002`
- Swagger redirect: `http://localhost:3002/swagger/v1/json`
- Raw JSON: `http://localhost:3002/swagger/v1/swagger.json`
- Raw YAML: `http://localhost:3002/swagger/v1/swagger.yaml`

---

## Tests

| Command | Description |
| --- | --- |
| `pytest -m util` | Run parser util scenarios (`@util`). |
| `pytest -m api` | Run API scenarios (`@api`). |
| `pytest -q` | Run everything. |
| `python tooling/run_bdd.py --marker api` | Orchestrated run that writes logs + JSON summaries to `.results/`. |

Screenplay actors are created via the `actor` fixture in `tests/conftest.py`. Tasks and questions write to `screenplay/support/memory_keys.py`, mirroring the TypeScript key names.

Recent updates:

- API feature tables now mirror DEMOAPP001/003; assertions reuse the shared parser modules to verify real UTC timestamps and generated strings rather than placeholder shapes.
- Step definitions validate dynamic string character sets/lengths so contract regressions surface immediately.
- The new `tooling/run_bdd.py` CLI (plus `tooling/summary_renderer.py`) provides a single entry point that the batch orchestrator can call when it needs pytest logs and machine-readable summaries. Use the `--marker` flag to target util or api suites.

---

## Automation Script

```bat
call .batch\RUN_DEMOAPP004_PYTHON_PLAYWRIGHT_API_AND_TESTS.BAT
```

The runner:

1. Loads `.env` overrides, sets `API_BASE_URL`, and probes port `3002`.
2. Runs `pytest -m util` first.
3. Starts the FastAPI host (`python -m src.server`) if the port is free and opens Swagger.
4. Runs `pytest -m api`.
5. Stops the API it launched and writes logs to `.results/demoapp004_python_playwright_<UTC>.txt`.

---

## Backlog and Tooling Notes

- `tooling/run_bdd.py` and `tooling/summary_renderer.py` are placeholders; finishing them lets the orchestrator delegate to a single entry point similar to the TypeScript stack.
- `features/step_definitions/world.py` still needs to instantiate the Screenplay actor through pytest-bdd hooks instead of leaving the fixture empty.
- Use `playwright.cmd` when installing browsers so the Python CLI is always used even if the .NET Playwright CLI appears earlier on `%PATH%`.
