# Screenplay Guide – DEMOAPP004

## Actor Lifecycle
- `tests/conftest.py` provisions an `Actor("Python API Tester")` per scenario.
- Abilities attached:
  - `CallAnApi` → wraps Playwright `APIRequestContext`.
  - `UseTokenParsers` → exposes `parse_date` / `parse_dynamic_string` helpers.
- `actor.forget()` is available for future scenarios that require clean memory mid-test.

## Tasks
| Task | Purpose |
| --- | --- |
| `SendGetRequest(endpoint, params)` | Performs REST calls and stores the Playwright `APIResponse`. |
| `ParseTokenLocally(token, parser_type)` | Executes parser utilities (`DATE` / `DYNAMIC`) and stores the result for assertions. |

All tasks use pedagogical logging/docstrings explaining behaviour to mirror DEMOAPP001.

## Questions
- `ResponseStatus` and `ResponseBody` are the canonical ways to interrogate HTTP responses; avoid reaching into memory directly from steps.
- Util scenarios should prefer `MemoryKeys.LAST_UTIL_RESULT` instead of ad-hoc globals.

## Extending the Pattern
1. Add new abilities/tasks/questions as modules under `screenplay/`.
2. Keep docstrings updated so engineers understand the intent.
3. When sharing helpers with other languages, reference this file and `screenplay_parity_typescript.md` to ensure parity.
