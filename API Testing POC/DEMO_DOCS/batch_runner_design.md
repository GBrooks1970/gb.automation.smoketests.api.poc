# Batch Runner & Metrics Design

**Version 1 – 14/11/25**

This document is the source of truth for the automation scripts that start APIs, execute tests, and collect run metrics. It covers:

1. `.batch/RUN_ALL_API_AND_TESTS.BAT` – the orchestrator invoked locally or in CI.
2. The three per-project runners.
3. The helper PowerShell utilities that keep the runners deterministic.
4. The metrics artefacts written to `.results/run_metrics_<UTC>.{metrics,txt,md}`.

Use this specification whenever a new demo stack is added or an existing runner changes.

---

## 1. Shared Helper: `env_utils.bat`

All runners depend on `env_utils.bat` for:

- **Environment hydration** – `load_env_vars <APP_DIR> <defaultPort> <defaultBaseUrl> PORT_VAR URL_VAR`.
- **Port probing** – `is_port_in_use <PORT> RETURN_VAR` maps to `Test-PortInUse.ps1`.
- **Process cleanup** – common routines that stop PIDs after the suite completes.

Any new runner must call `load_env_vars` before launching its API and call `is_port_in_use` before attempting to bind to a port.

---

## 2. Orchestrator: `RUN_ALL_API_AND_TESTS.BAT`

**Purpose**: Execute the three project runners sequentially, capture their logs, and produce summary artefacts.

### Inputs
- Relies on the three per-project BAT files living in `.batch`.
- Assumes `.results` exists in the repo root (creates if missing).

### Flow
1. Timestamp the run (`RUN_UTC`) and initialise raw metrics file `run_metrics_<UTC>.metrics`.
2. For each project:
   - Capture the latest log file name before execution using `.batch/.ps/get-latest-log.ps1`.
   - Check port availability; if already taken, set `SKIP_API_START=1` so the child runner leaves the existing API intact.
   - Invoke the per-project BAT; capture its exit code.
   - Capture the latest log file after execution and print a summary via `:report_result`.
3. Update `OVERALL_EXIT` whenever a suite fails.
4. Append `OverallExit` to the raw metrics file and call `.batch/.ps/render-run-metrics.ps1` to render the human-readable `.txt` and `.md` artefacts.
5. Exit with the overall exit code.

### Output
- Individual suite logs referenced by the runners (e.g., `demoapp001_typescript_cypress_<UTC>.txt`).
- Raw metrics: `run_metrics_<UTC>.metrics`.
- Formatted summaries described in section 4.

---

## 3. Per-Project Runners

All three follow the same shape:

| Script | API Port | Util Tests | Main Tests | Log Outputs |
| --- | --- | --- | --- | --- |
| `RUN_DEMOAPP001_TYPESCRIPT_CYPRESS_API_AND_TESTS.BAT` | 3000 | `npm run test:bdd --spec cypress/integration/util-tests/**` | Full Cypress run | `.results/demoapp001_typescript_cypress_<UTC>.txt`, `.results/demoapp001_typescript_cypress_util_<UTC>.txt` |
| `RUN_DEMOAPP002_CSHARP_PLAYWRIGHT_API_AND_TESTS.BAT` | 5228 | `dotnet test ... --filter "TestCategory=utiltests"` | `dotnet test` (full SpecFlow suite) | `.results/demoapp002_csharp_playwright_<UTC>.txt`, `.results/demoapp002_csharp_playwright_util_<UTC>.txt` |
| `RUN_DEMOAPP003_TYPESCRIPT_PLAYWRIGHT_API_AND_TESTS.BAT` | 3001 | `npm run test:bdd -- --tags @UTILTEST` | Full Playwright + Cucumber run | `.results/demoapp003_typescript_playwright_<UTC>.txt`, `.results/demoapp003_typescript_playwright_util_<UTC>.txt` |

### Common Responsibilities
1. **Load env vars** via `env_utils.bat`.
2. **Start the API** unless `SKIP_API_START` is set or the port is already bound.
3. **Open Swagger** (matching `RUN_ALL_APIS_AND_SWAGGER` behaviour) to validate documentation availability.
4. **Run util tests first** so failures short-circuit before API suites.
5. **Run main tests**, capturing logs in `.results`.
6. **Stop the API** if the runner started it.
7. **Echo results** (success/failure + log paths) for visibility and for the orchestrator to consume.

---

## 4. Metrics Artefacts

Each orchestrator run produces three files sharing the same timestamp:

| File | Purpose |
| --- | --- |
| `run_metrics_<UTC>.metrics` | Raw machine-readable key/value pairs (`Suite_Exit=code,Suite_Log=path`, `OverallExit=value`). The orchestrator appends to this file and the renderer consumes it. |
| `run_metrics_<UTC>.txt` | Human-readable ASCII table summarising each suite (`Time`, `Tests`, `Pass`, `Fail`, `Pending`, `Skip`) followed by the log file locations. |
| `run_metrics_<UTC>.md` | Markdown summary with the same fields, used for PR comments or wiki updates. |

### Renderer: `.batch/.ps/render-run-metrics.ps1`

1. Parses the raw metrics file and loads each log to extract:
   - Duration (where available).
   - Total tests, passes, fails, pending, skips.
2. Generates the ASCII block and Markdown table.
3. Writes the `.txt` and `.md` outputs to `.results`.

If a suite fails to produce a log, the renderer marks the entry with `-` and `unavailable` so missing data is obvious.

---

## 5. Adding a New Runner

1. Copy one of the existing scripts as a template.
2. Update the `APP_DIR`, ports, util/main commands, and log file names.
3. Ensure the new runner is invoked from `RUN_ALL_API_AND_TESTS.BAT` and from `RUN_ALL_APIS_AND_SWAGGER.BAT` (if appropriate).
4. Update this design document and the README to include the new stack.
5. Extend `.batch/.ps/render-run-metrics.ps1` to parse the new log format if necessary.

By following this design, every stack provides a predictable automation experience and consistent reporting, reducing surprises across runtimes.
