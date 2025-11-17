# Batch Runner and Metrics Design

**Version 3 - 17/11/25**

This document is the source of truth for the automation scripts that start APIs, execute tests, and collect run metrics. It covers:

1. `.batch/RUN_ALL_API_AND_TESTS.BAT` - the orchestrator invoked locally or in CI.`r`n2. `.batch/RUN_ALL_APIS_AND_SWAGGER.BAT` - the API warm-up helper.`r`n3. The four per-project runners.`r`n4. The helper PowerShell utilities that keep the runners deterministic.`r`n5. The metrics artefacts written to `.results/run_metrics_<UTC>.{metrics,txt,md}`.

Use this specification whenever a new demo stack is added or an existing runner changes.

---

## 1. Shared Helper: `env_utils.bat`

All runners depend on `env_utils.bat` for:

- **Environment hydration** - `load_env_vars <APP_DIR> <defaultPort> <defaultBaseUrl> PORT_VAR URL_VAR`.
- **Port probing** - `is_port_in_use <PORT> RETURN_VAR` maps to `Test-PortInUse.ps1`.
- **Process cleanup** - common routines that stop PIDs after the suite completes.

Any new runner must call `load_env_vars` before launching its API and call `is_port_in_use` before attempting to bind to a port.

---

## 2. Orchestrator: `RUN_ALL_API_AND_TESTS.BAT`

**Purpose**: Execute the four project runners sequentially, capture their logs, and produce summary artefacts.

### Inputs
- Relies on the four per-project BAT files living in `.batch`.
- Assumes `.results` exists in the repo root (creates if missing).

### Flow
1. Timestamp the run (`RUN_UTC`) and initialise raw metrics file `run_metrics_<UTC>.metrics`.
2. Hydrate helper variables:
   - `TS/CS/PW/PY_SCRIPT` for the child runners.
   - `APPx_DIR` to feed `env_utils.bat`.
   - `RESULT_DIR`, `METRICS_RAW`, `METRICS_FILE`, `METRICS_MD`.
3. For each project:
   - Capture the latest log file name before execution using `.batch/.ps/get-latest-log.ps1`.
   - Load env vars + port defaults, then use `env_utils.bat is_port_in_use` to decide whether to set `SKIP_API_START`.
   - Invoke the per-project BAT; capture its exit code by reading `%ERRORLEVEL%`.
   - Capture the latest log file after execution and print a summary via `:report_result`.
   - OR the exit code into `OVERALL_EXIT`.
4. Append per-suite lines plus `OverallExit` to the raw metrics file and call `.batch/.ps/render-run-metrics.ps1` to render `.txt` and `.md`.
5. Pop the pushed directories, return `OVERALL_EXIT`.

### Key Environment Variables
- `SKIP_API_START` (inherited by child runners) tells them to reuse an already running API.
- `API_BASE_URL` is set by `env_utils.bat load_env_vars` so Screenplay abilities always point to the correct port.
- `RUN_UTC` acts as the run identifier for both logs and metrics.

### Output
- Individual suite logs referenced by the runners (e.g., `demoapp001_typescript_cypress_<UTC>.txt`).
- Raw metrics: `run_metrics_<UTC>.metrics`.
- Formatted summaries described in section 4.

---

## 3. API Warm-Up Script: `RUN_ALL_APIS_AND_SWAGGER.BAT`

**Purpose**: Start every API and open documentation endpoints for manual verification.

1. Resolves `_API_TESTING_GHERKIN_` directories for DEMOAPP001, DEMOAPP003, and DEMOAPP002.
2. Loads environment defaults using `env_utils.bat load_env_vars` so ports and base URLs stay in sync with `.env`.
3. Checks each port with `is_port_in_use`; starts the API only when the port is free. This prevents duplicate servers when developers already have a local API running.
4. Launches APIs using the same helpers as the per-project runners:
   - DEMOAPP001 and DEMOAPP003: `Start-Process cmd.exe /c npm run start`.
   - DEMOAPP002: `Start-Process dotnet run --no-build --urls http://localhost:<port>`.
5. Opens Swagger or docs in a browser: `/swagger/v1/json` for the TypeScript stacks and `/swagger/` for the .NET host.
6. Waits for a keypress, then stops any PIDs it launched via `:stop_process`.

Use this script before exploratory testing sessions or when validating contract documentation without running the test suites.

---

## 4. Per-Project Runners

All four follow the same shape:

| Script | API Port | Util Tests | Main Tests | Log Outputs |
| --- | --- | --- | --- | --- |
| `RUN_DEMOAPP001_TYPESCRIPT_CYPRESS_API_AND_TESTS.BAT` | 3000 | `npm run test:bdd --spec cypress/integration/util-tests/**` | Full Cypress run | `.results/demoapp001_typescript_cypress_<UTC>.txt`, `.results/demoapp001_typescript_cypress_util_<UTC>.txt` |
| `RUN_DEMOAPP002_CSHARP_PLAYWRIGHT_API_AND_TESTS.BAT` | 5228 | `dotnet test ... --filter "TestCategory=utiltests"` | `dotnet test` (full SpecFlow suite) | `.results/demoapp002_csharp_playwright_<UTC>.txt`, `.results/demoapp002_csharp_playwright_util_<UTC>.txt` |
| `RUN_DEMOAPP003_TYPESCRIPT_PLAYWRIGHT_API_AND_TESTS.BAT` | 3001 | `npm run test:bdd -- --tags @UTILTEST` | `npm run test:bdd` (all tags) | `.results/demoapp003_typescript_playwright_<UTC>.txt`, `.results/demoapp003_typescript_playwright_util_<UTC>.txt` |
| `RUN_DEMOAPP004_PYTHON_PLAYWRIGHT_API_AND_TESTS.BAT` | 3002 | `python -m pytest -m util` | `python -m pytest -m api` | `.results/demoapp004_python_playwright_<UTC>.txt`, `.results/demoapp004_python_playwright_util_<UTC>.txt` |

### Common Responsibilities
1. **Load env vars** via `env_utils.bat`.
2. **Start the API** unless `SKIP_API_START` is set or the port is already bound.
3. **Open Swagger** (matching `RUN_ALL_APIS_AND_SWAGGER` behaviour) to validate documentation availability.
4. **Run util tests first** so failures short-circuit before API suites.
5. **Run main tests**, capturing logs in `.results`.
6. **Stop the API** if the runner started it.
7. **Echo results** (success/failure + log paths) for visibility and for the orchestrator to consume.

### Script Details
- **DEMOAPP001 (Cypress)**
  - Loads `.env` overrides, clears `ELECTRON_RUN_AS_NODE` before calling `npx cypress run`, then restores the variable to avoid side effects.
  - Util suite scopes `--spec cypress/integration/util-tests/**`, main suite runs everything so API flow reuse is validated.
  - Swagger automatically opens at `http://localhost:3000/swagger/v1/json`.
- **DEMOAPP002 (SpecFlow + Playwright)**
  - Starts/stops the ASP.NET API via `dotnet run --urls http://localhost:5228`.
  - Executes util tests via `dotnet test --filter "TestCategory=utiltests"` before the full suite.
  - Calls `playwright.ps1 install` (when available) to ensure browser binaries are present; logs util/API output separately.
- **DEMOAPP003 (Playwright TS)**
  - `npm run test:bdd -- --tags @UTILTEST` for util coverage, followed by the default `npm test` run (Cucumber + Playwright).
  - Uses `env_utils.bat` to populate `API_BASE_URL` so Screenplay abilities can attach to the right endpoint.
- **DEMOAPP004 (Playwright PY)**
  - Relies on `python -m pytest -m util` and `python -m pytest -m api`, which map to `@util` and `@api` tags in the feature files.
  - Starts the FastAPI host via `python -m src.server` and detects readiness using `Test-NetConnection`.
  - Opens FastAPI docs at `http://localhost:3002/docs` to mirror the parity experience.
  - Uses the repo-provided `playwright.cmd` so the Python CLI is always invoked, even when the .NET CLI appears earlier on `%PATH%`.

---

## 5. Metrics Artefacts

Each orchestrator run produces three files sharing the same timestamp:

| File | Purpose |
| --- | --- |
| `run_metrics_<UTC>.metrics` | Raw machine-readable key/value pairs (`Suite_Exit=code,Suite_Log=path`, `OverallExit=value`). The orchestrator appends to this file and the renderer consumes it. |
| `run_metrics_<UTC>.txt` | Human-readable ASCII table summarising each suite (`Suite`, `Exit`, `Log`, `Pass`, `Fail`, `Skip`, `Pending`). |
| `run_metrics_<UTC>.md` | Markdown summary with the same fields, used for PR comments or wiki updates. |

### Raw Metrics Schema
Each `.metrics` file uses one `key=value` entry per line:

```
RUN UTC: 20251116T1552Z
Cypress_Exit=0,Cypress_Log=D:\path\demoapp001_typescript_cypress_20251116T1552Z.txt
Playwright TS_Exit=0,Playwright TS_Log=D:\path\demoapp003_typescript_playwright_20251116T1553Z.txt
Playwright PY_Exit=0,Playwright PY_Log=D:\path\demoapp004_python_playwright_20251116T1554Z.txt
.NET Playwright_Exit=0,.NET Playwright_Log=D:\path\demoapp002_csharp_playwright_20251116T1554Z.txt
OverallExit=0
```

- Suite labels must be unique (no spaces except when reporting labels such as `Playwright TS`), because the renderer looks for `<suite>_Exit` and `<suite>_Log`.
- Every run must end with `OverallExit=<code>` so dashboards can tell whether the orchestrator succeeded even if a suite failed to produce logs.

### Renderer: `.batch/.ps/render-run-metrics.ps1`

1. Parses the raw metrics file and loads each log to extract:
   - Duration (where available).
   - Total tests, passes, fails, pending, skips.
2. Generates the ASCII block and Markdown table.
3. Writes the `.txt` and `.md` outputs to `.results`.

If a suite fails to produce a log, the renderer marks the entry with `-` and `unavailable` so missing data is obvious.

---

## 5. Adding or Updating a Runner

1. Copy one of the existing scripts as a template.
2. Update the `APP_DIR`, ports, util/main commands, and log file names.
3. Ensure the new runner is invoked from `RUN_ALL_API_AND_TESTS.BAT` and from `RUN_ALL_APIS_AND_SWAGGER.BAT` (if appropriate).
4. Update this design document, the README, and `new_demo_requirements.md` to include the new stack.
5. Extend `.batch/.ps/render-run-metrics.ps1` to parse the new log format if necessary.

By following this design, every stack provides a predictable automation experience and consistent reporting, reducing surprises across runtimes.

---

## 6. Appendix: Execution Sequence Summary

1. Developer or CI agent runs `.batch/RUN_ALL_API_AND_TESTS.BAT`.
2. Orchestrator validates the presence of all per-project scripts and initialises `.results`.
3. Each runner:
   - Loads environment defaults and checks ports.
   - Starts/stops its API when required.
   - Runs util suite, then API suite, writing logs named `demoapp###_<stack>_<UTC>.txt`.
4. Orchestrator records exit/log pairs, renders human-readable summaries, and exits with the combined result.

