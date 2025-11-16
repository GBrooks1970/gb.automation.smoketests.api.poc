# DEMOAPP004 – Playwright (Python) Token Parser Tests

This directory houses the upcoming Playwright + Python Screenplay demo for the Token Parser API. The stack is being bootstrapped according to `API Testing POC/DEMO_DOCS/DEMOAPP004_blueprint.md` and `API Testing POC/DEMO_DOCS/new_demo_requirements.md`.

## Current Status
- Repository structure scaffolded (docs, src, screenplay, features, tooling, tests).
- Implementation pending: API host, Screenplay abilities/tasks, pytest-bdd features, automation scripts.

## Next Steps
1. Port the Token Parser utilities into `src/tokenparser/` _(in progress)_.
2. Implement Screenplay helpers under `screenplay/`.
3. Add pytest-bdd feature files/tests under `features/`.
4. Wire up batch runners and metrics integration per `batch_runner_design.md`.

## Playwright CLI Wrapper
This directory now contains a `playwright.cmd` helper that delegates to the Python CLI. Run commands such as:

```powershell
cd _API_TESTING_GHERKIN_/DEMOAPP004_PYTHON_PLAYWRIGHT
playwright install  # internally executes `python -m playwright install`
```

The wrapper prevents the “Couldn't find project using Playwright” error that appears when the .NET Playwright CLI is found earlier on `%PATH%`.
