# DEMOAPP004 – Playwright (Python) Screenplay Blueprint  
_Version 1 · 14/11/25_

## Pre-Implementation Checklist
- Align scope with `new_demo_requirements.md` (API contract, Screenplay parity, automation/metrics, docs).  
  _Validated – requirements mapped; proceed to architecture._
- Select stack: Playwright as the test tool, Python as the codebase, pytest-bdd for Gherkin.  
  _Validated – stack chosen; continue to repo structure._
- Define repo layout, environment management, and orchestration hooks (per `batch_runner_design`).  
  _Validated – structure drafted; next step: detail Screenplay components._
- Capture QA/ISTQB strategy (risk-based coverage, traceability, fail-fast util suite).  
  _Validated – strategy outline ready; embed in docs._
- Plan implementation journal for future worklogs and reviews.  
  _Validated – journal template set._

---

## Solution Overview
Deliver `_API_TESTING_GHERKIN_/DEMOAPP004_PYTHON_PLAYWRIGHT`, a production-ready Screenplay automation stack that:
- Targets the Token Parser API contract (`/alive`, `/parse-dynamic-string-token`, `/parse-date-token`).
- Uses Playwright (Python async API) as the HTTP test client.
- Implements Screenplay actors/abilities/tasks/questions in Python.
- Runs BDD scenarios via `pytest-bdd` + `pytest-playwright`.
- Integrates with existing batch orchestrator + metrics pipeline.

---

## Project Structure
```
_API_TESTING_GHERKIN_/DEMOAPP004_PYTHON_PLAYWRIGHT/
│
├── docs/
│   ├── ARCHITECTURE.md
│   ├── QA_STRATEGY.md
│   └── SCREENPLAY_GUIDE.md
│
├── src/
│   └── tokenparser/                  # Shared date/string parsers (Python port)
│
├── screenplay/
│   ├── actors/actor.py
│   ├── abilities/
│   │   ├── call_an_api.py
│   │   └── use_token_parsers.py
│   ├── tasks/
│   │   ├── send_get_request.py
│   │   └── parse_token_locally.py
│   ├── questions/
│   │   ├── response_status.py
│   │   └── response_body.py
│   └── support/
│       ├── memory.py
│       └── memory_keys.py
│
├── features/
│   ├── api/                          # alive, parse-date, parse-dynamic
│   ├── util-tests/
│   └── step_definitions/
│       └── world.py                  # pytest-bdd hooks to instantiate actors
│
├── tooling/
│   ├── run_bdd.py                    # CLI wrapper emitting JSON + ASCII summaries
│   └── summary_renderer.py
│
├── tests/                            # Optional unit tests for parsers/utilities
├── .env.example
├── pyproject.toml
├── pytest.ini
└── README.md
```

---

## Screenplay Implementation Highlights
### Actor
```python
# screenplay/actors/actor.py
from screenplay.support.memory import ActorMemory

class Actor:
    def __init__(self, name: str):
        self.name = name
        self._abilities = {}
        self.memory = ActorMemory()

    def can(self, ability):
        self._abilities[type(ability)] = ability
        return self

    def ability(self, ability_cls):
        return self._abilities[ability_cls]

    async def attempts_to(self, *tasks):
        for task in tasks:
            await task.perform_as(self)
```

### Abilities
```python
# screenplay/abilities/call_an_api.py
from playwright.async_api import APIRequestContext

class CallAnApi:
    def __init__(self, context: APIRequestContext):
        self.context = context

# screenplay/abilities/use_token_parsers.py
from src.tokenparser import TokenDateParser, TokenDynamicStringParser

class UseTokenParsers:
    def __init__(self):
        self.date_parser = TokenDateParser()
        self.string_parser = TokenDynamicStringParser()
```

### Tasks & Questions
- `SendGetRequest(endpoint, params)` stores responses in actor memory.
- `ParseTokenLocally` tasks reuse parser abilities for util scenarios.
- `ResponseStatus` / `ResponseBody` questions read from memory for assertions.

---

## QA & ISTQB Strategy
| Principle | Implementation |
| --- | --- |
| Risk-Based Testing | Tag high-risk scenarios (`@high_risk`) for priority execution. |
| Traceability | Maintain `TRACEABILITY.md` linking contract requirements → scenarios → logs. |
| Early Testing | Util suite executes before API suite; batch runner fails fast on util failures. |
| Defect Clustering | Metrics highlight util/API failures separately. |
| Testware Maintenance | Screenplay abstractions minimize duplication; doc updates part of Definition of Done. |

**Best Practices**
- Enforce `pytest --maxfail=1` for util tests.
- Capture Playwright traces for failing API scenarios.
- Emit JSON summaries for orchestrator metrics to avoid log scraping.
- Centralize Scenario Outline data in JSON/YAML for reuse across stacks (future enhancement).

---

## Automation & Metrics Integration
### Batch Runner (`.batch/RUN_DEMOAPP004_PYTHON_PLAYWRIGHT_API_AND_TESTS.BAT`)
1. Load env vars via `env_utils.bat`.
2. Check port (default `3002`) using `Test-PortInUse.ps1`; honor `SKIP_API_START`.
3. Start API + poll `/alive`.
4. Open Swagger UI.
5. Run util suite: `pytest -m util --maxfail=1`.
6. Run API suite: `pytest -m api --maxfail=1`.
7. Stop API if runner launched it.
8. Echo log paths; write util/API logs under `.results/`.

### Orchestrator
- Add DEMOAPP004 block to `RUN_ALL_API_AND_TESTS.BAT`.
- Ensure `tooling/summary_renderer.py` produces entries consumable by `.batch/.ps/render-run-metrics.ps1`.
- Update `API Testing POC/DEMO_DOCS/batch_runner_design.md` with DEMOAPP004 specifics.

---

## Documentation Checklist
- `README.md` – mention DEMOAPP004 in quick start + automation sections.
- `API Testing POC/DEMO_DOCS/DEMOAPP004_python_playwright.md` – dedicated project doc.
- `API Testing POC/DEMO_DOCS/screenplay_parity_typescript.md` – add Python column.
- `API Testing POC/api_testing_comparison.md` – update pros/cons table.
- `API Testing POC/DEMO_DOCS/new_demo_requirements.md` – reference completion status.

---

## Implementation Journal (template)
- Scope confirmation & stack selection.
- Screenplay scaffolding implemented (actors/abilities/tasks/questions).
- BDD features cloned with Scenario Outlines.
- Batch runner wired; Swagger + util-first logic confirmed.
- Metrics JSON hooked into renderer; orchestrator run validated.
- Docs updated; checklist signed off.

---

## Definition of Done
1. API contract endpoints implemented + Swagger reachable.
2. Screenplay actors/abilities/tasks/questions operational.
3. Util + API suites passing; logs stored in `.results/`.
4. Batch runner + orchestrator integration complete; metrics files include DEMOAPP004.
5. Docs (README, project doc, comparison report, parity note) updated.
6. `new_demo_requirements.md` checklist fully satisfied.
