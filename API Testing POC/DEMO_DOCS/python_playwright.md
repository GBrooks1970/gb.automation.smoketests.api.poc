# DEMOAPP004 - FastAPI / Playwright (Python) Screenplay

**Version 2 - [17/11/25]**

`_API_TESTING_GHERKIN_/DEMOAPP004_PYTHON_PLAYWRIGHT` delivers the Token Parser contract using FastAPI plus pytest-bdd Screenplay tests backed by Playwright request contexts. The API listens on `http://localhost:3002` and reuses the same parser implementations found in the TypeScript and .NET stacks.

---

## Contract Summary

Endpoints mirror the shared specification:

| Path | Notes |
| --- | --- |
| `GET /alive` | `{ "Status": "ALIVE-AND-KICKING" }`. |
| `GET /parse-dynamic-string-token` | Query `token`. Success: `{ "ParsedToken": "<string>" }`. Error: `{ "Error": "Invalid string token format" }`. |
| `GET /parse-date-token` | Query `token`. Success uses UTC `yyyy-MM-dd HH:mm:ssZ`. |

Swagger resources:

- Redirect: `http://localhost:3002/swagger/v1/json`
- JSON: `http://localhost:3002/swagger/v1/swagger.json`
- YAML: `http://localhost:3002/swagger/v1/swagger.yaml`

---

## Layout

```
_API_TESTING_GHERKIN_/DEMOAPP004_PYTHON_PLAYWRIGHT/
  docs/             Architecture, QA, Screenplay guides (in progress)
  src/server.py     FastAPI host
  src/tokenparser/  Python ports of the date/dynamic parsers
  screenplay/       Actors, abilities, tasks, questions, memory helpers
  features/         pytest-bdd feature files tagged @api / @util
  tests/            pytest fixtures (`conftest.py`) and shared hooks
  tooling/          run_bdd.py and summary renderer placeholders
  .batch/           Automation helpers
  .results/         Timestamped pytest logs
```

---

## Quick Start

```powershell
cd _API_TESTING_GHERKIN_/DEMOAPP004_PYTHON_PLAYWRIGHT
python -m venv .venv
.\.venv\Scripts\Activate
pip install -e .[dev]
python -m playwright install
python -m src.server
```

Run util tests: `pytest -m util`

Run API tests: `pytest -m api`

`tests/conftest.py` creates an `Actor("Python API Tester")` per scenario, attaches `CallAnApi` (Playwright `APIRequestContext`) and `UseTokenParsers`, and provides a `scenario_context` dict for step-level state.

---

## Automation

| Script | Description |
| --- | --- |
| `.batch/RUN_DEMOAPP004_PYTHON_PLAYWRIGHT_API_AND_TESTS.BAT` | Runs util tests first (`pytest -m util`), starts the FastAPI host if port 3002 is free, opens Swagger, runs API tests (`pytest -m api`), and stops the server. Logs land in `.results/demoapp004_python_playwright_<UTC>.txt`. |
| `.batch/RUN_ALL_API_AND_TESTS.BAT` | Executes this runner after the TypeScript suites, capturing log paths and exit codes for the metrics files. |

Future work: `tooling/run_bdd.py` and `tooling/summary_renderer.py` will mirror the TypeScript summary outputs so the orchestrator can call a single CLI entry point.

---

## Screenplay Snapshot

- **Actors**: `screenplay/actors/actor.py` with memory management; fixtures create one actor per scenario.
- **Abilities**: `CallAnApi` wraps Playwright API requests; `UseTokenParsers` exposes Python parser helpers.
- **Tasks**: `screenplay/tasks/send_get_request.py` performs HTTP calls; `parse_token_locally.py` exercises parsers for util steps.
- **Questions**: `screenplay/questions/response_status.py` and `response_body.py` fetch values from actor memory using shared keys defined in `screenplay/support/memory_keys.py`.

Refer to `API Testing POC/DEMO_DOCS/screenplay_parity_demoapps.md` for the cross-stack matrix.

---

## Backlog / Parity Items

1. Implement `features/step_definitions/world.py` so pytest-bdd hooks instantiate Screenplay actors instead of a TODO stub.
2. Finish `tooling/run_bdd.py` and `tooling/summary_renderer.py` so the batch runner can consume structured metrics, just like the TypeScript projects.
3. Expand feature tables to match the seven date rows and six dynamic rows from DEMOAPP001/003.

---

## References

- Main README
- `_API_TESTING_GHERKIN_/DEMOAPP004_PYTHON_PLAYWRIGHT/docs`
- Companion docs: `typescript_cucumber_cypress.md`, `typescript_cucumber_playwright.md`, `csharp_specflow_playwright.md`
- Contract + automation specs: `tokenparser_api_contract.md`, `batch_runner_design.md`, `screenplay_parity_demoapps.md`
