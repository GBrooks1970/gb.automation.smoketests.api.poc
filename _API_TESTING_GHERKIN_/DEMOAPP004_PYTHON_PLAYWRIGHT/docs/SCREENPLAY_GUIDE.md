# Screenplay Guide – DEMOAPP004 (Python)

**Version 2 – 18/11/25**

## 1. Actor Lifecycle
- Actors are defined in `screenplay/actors/actor.py`.
- `features/step_definitions/world.py` contains pytest-bdd hooks (`@pytest_bdd.before_scenario`, `after_scenario`) that instantiate `"Python API Tester"` actors, attach abilities, and clear memory between scenarios.
- Fixtures in `screenplay/core/fixtures.py` expose `api_actor`/`util_actor` helpers to step modules.

## 2. Abilities
| Ability | Module | Description |
| --- | --- | --- |
| `CallAnApi` | `screenplay/abilities/call_an_api.py` | Wraps Playwright Python `APIRequestContext` for HTTP calls. |
| `UseTokenParsers` | `screenplay/abilities/use_token_parsers.py` | Provides access to `TokenDateParser`/`TokenDynamicStringParser` from `src/tokenparser`. |

## 3. Tasks & Questions
- Tasks located in `screenplay/tasks/`:
  - `send_get_request.py`
  - `parse_token_locally.py`
  - Future tasks should follow the same functional style (`async def` returning `None`).
- Questions located in `screenplay/questions/`:
  - `response_status.py`
  - `response_body.py`
  - Add new questions for domain assertions rather than placing asserts in steps.

## 4. Memory Keys & Helpers
- Constants defined in `screenplay/support/memory_keys.py` align with TS/.NET stacks (`LAST_RESPONSE`, `LAST_PARSED_DATE`, etc.).
- `screenplay/support/util_actor_memory.py` provides typed getters/setters for pytest contexts.
- Always reference keys from this module to avoid parity drift.

## 5. Step Definition Style
```
from screenplay.tasks.send_get_request import SendGetRequest

@given("the FastAPI host is alive")
async def api_is_alive(api_actor):
    await api_actor.attempts_to(SendGetRequest.to("/alive"))
```
- Steps import fixtures from `features/step_definitions/conftest.py` or `world.py`.
- Keep steps declarative; orchestration belongs in tasks/questions.

## 6. Parity Checklist
1. Util features must carry `@util`; API features may use `@api`. Batch scripts map these to pytest markers.
2. Update `API Testing POC/DEMO_DOCS/screenplay_parity_demoapps.md` whenever abilities/tasks/questions change.
3. Ensure `tooling/run_bdd.py` prints summary lines expected by `.batch/.ps/render-run-metrics.ps1` after modifying reporters.
4. Mirror changes in DEMOAPP001/003/002 to keep Screenplay parity intact.

## 7. Troubleshooting
- If Playwright contexts fail to start, confirm `python -m playwright install` has been executed in the active virtual environment.
- When pytest-bdd cannot locate hooks, ensure `world.py` is imported via `conftest.py`.
- Use `TOKENPARSER_LOG_LEVEL=debug` to inspect ability acquisition/release messages in `.results`.
