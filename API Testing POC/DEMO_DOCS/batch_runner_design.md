# Batch Runner and Metrics Design

**Version 4 - 18/11/25**

This specification is the canonical reference for every automation script that exercises the demo stacks. It documents:

1. Shared helpers (Batch + PowerShell) that keep runners deterministic.
2. The orchestrator `.batch/RUN_ALL_API_AND_TESTS.BAT`.
3. The API warm-up helper `.batch/RUN_ALL_APIS_AND_SWAGGER.BAT`.
4. Individual project runners and their lifecycles.
5. Metrics artefacts emitted under `.results/run_metrics_<UTC>.*`.
6. Change-management rules for introducing new demos.

Consult this file whenever a runner, helper, or metrics format changes. All documentation, READMEs, and new demo proposals must stay in sync with it.

---

## 1. Shared Building Blocks

### 1.1 `env_utils.bat`

Every runner imports `env_utils.bat` to guarantee consistent defaults:

- `load_env_vars <APP_DIR> <defaultPort> <defaultBaseUrl> PORT_VAR URL_VAR`  
  Hydrates `.env` overrides, sets `API_BASE_URL`, and persists the resolved port/base URL into the calling script.
- `is_port_in_use <PORT> RETURN_VAR`  
  Shells into `Test-PortInUse.ps1` to decide whether the API must start locally.
- `stop_process <Label> <PID>`  
  Shuts down PIDs collected in the runner.

### 1.2 PowerShell Helpers

`/.batch/.ps` hosts supporting utilities:

| Script | Purpose |
| --- | --- |
| `get-latest-log.ps1` | Returns the newest log in `.results` that matches the supplied prefix. |
| `render-run-metrics.ps1` | Transforms the raw metrics file into `.txt` and `.md` summaries. |
| `Test-PortInUse.ps1` | Tests whether a TCP port is bound. |

Any new automation must reuse these helpers instead of duplicating logic.

---

## 2. Orchestrator - `RUN_ALL_API_AND_TESTS.BAT`

**Responsibility**: Execute all demo runners sequentially, capture their util + API results, and emit metrics artefacts for CI dashboards.

### 2.1 Inputs & Environment

- Requires all per-project BAT files in `.batch`.
- Creates `.results` when missing.
- Key environment variables:

| Variable | Description |
| --- | --- |
| `RUN_UTC` | UTC timestamp for the run (for example `20251118T1406Z`). Used in log names and metrics files. |
| `SKIP_API_START` | Propagated to child runners. When set, runners only execute tests and never launch APIs. |
| `API_BASE_URL` | Set by `env_utils.bat` for each project so Screenplay abilities share the same entry point. |
| `OVERALL_EXIT` | Bitwise OR of all runner exit codes. Determines orchestrator exit status. |

### 2.2 Sequence

1. Push repo root, timestamp the run, and initialise the raw metrics file `run_metrics_<UTC>.metrics`.
2. Resolve script paths for the four demos plus the helper PowerShell scripts.
3. For each demo (ordered 001 -> 004):
   1. Record the latest log before execution.
   2. Call `env_utils.bat load_env_vars` to hydrate `.env` overrides and compose `API_BASE_URL`.
   3. Probe the configured port; set `SKIP_API_START=1` for the child runner when the port is already bound or when the orchestration is piggybacking on a developer-hosted API.
   4. Invoke the child BAT, capture `%ERRORLEVEL%`, and log the generated util/API result files.
   5. Append `<Label>_Exit=<code>` and `<Label>_Log=<path>` pairs to the raw metrics file.
   6. OR the exit code into `OVERALL_EXIT`.
4. After all runners finish, append `OverallExit=<code>` to the raw metrics file.
5. Call `render-run-metrics.ps1` to build the `.txt` and `.md` summaries (section 5), then return to the caller with `%OVERALL_EXIT%`.

### 2.3 Error Handling

- Child runner failures never abort the orchestrator immediately - the next runner still executes. This keeps reporting consistent even when one stack is down.
- When a runner fails to write a log, the orchestrator still records its exit code. The renderer marks missing logs as `unavailable`.
- Non-zero `OVERALL_EXIT` propagates to CI, preventing false-positive builds.

---

## 3. API Warm-Up Helper - `RUN_ALL_APIS_AND_SWAGGER.BAT`

**Purpose**: Launch every demo API (001-004) together, open Swagger/Docs, then wait for manual verification. No tests execute.

### Flow

1. For each demo:
   - Resolve `<APP_DIR>` under `_API_TESTING_GHERKIN_/`.
   - Load env defaults via `load_env_vars`.
   - If the port is free and `SKIP_API_START` is not set, start the API using the same commands that the project runner uses.
   - Store the process ID for later shutdown.
2. After every API is online, open the corresponding documentation endpoint:
   - DEMOAPP001 -> `http://localhost:3000/swagger/v1/json`
   - DEMOAPP002 -> `http://localhost:5228/swagger/index.html`
   - DEMOAPP003 -> `http://localhost:3001/swagger/v1/json`
   - DEMOAPP004 -> `http://localhost:3002/docs`
3. Wait for any keypress before iterating through collected PIDs and stopping them through `stop_process`.

This helper is mandatory for contract reviews and manual smoke sessions because it ensures every stack shares the same boot process codified in the automated runners.

---

## 4. Per-Project Runner Specifications

Every runner performs the following high-level lifecycle:

1. Create timestamped util/API log names and ensure `.results` exists.
2. Run util-focused tests first to validate parser helpers without API traffic.
3. Start the API only when ports are free (or reuse an existing instance when `SKIP_API_START=1` or another developer already has it running).
4. Execute the full API suite.
5. Stop any processes launched during the run.
6. Emit friendly console summaries referencing the log files captured in `.results`.

Detailed expectations for each runner:

### 4.1 `RUN_DEMOAPP001_TYPESCRIPT_CYPRESS_API_AND_TESTS.BAT`

- **Port**: 3000 (`http://localhost:3000`).
- **Util suite**: `npm run test:bdd -- --tags @UTILTEST` (Cypress + Cucumber util scenarios).
- **API suite**: `npm run test:bdd` (entire Cypress suite).
- **API start**: `npm run start` launched via `cmd.exe /c` with PID tracking and readiness polling.
- **Logs**: `.results/demoapp001_typescript_cypress_util_<UTC>.txt` and `.results/demoapp001_typescript_cypress_<UTC>.txt`.
- **Notes**: Runner exports `CYPRESS_BASE_URL` and `API_BASE_URL` before shelling into Cypress so step definitions share the environment injected by `env_utils.bat`.

### 4.2 `RUN_DEMOAPP002_CSHARP_PLAYWRIGHT_API_AND_TESTS.BAT`

- **Port**: 5228 (`http://localhost:5228`).
- **Util suite**: `dotnet test TokenParserTests --filter "TestCategory=utiltests" --no-build`.
- **API suite**: `dotnet test TokenParserTests --no-build`.
- **API start**: `dotnet run --project TokenParserAPI --urls http://localhost:<port>` with PID capture.
- **Logs**: `.results/demoapp002_csharp_playwright_util_<UTC>.txt` and `.results/demoapp002_csharp_playwright_<UTC>.txt`.
- **Notes**: Ensures `TokenParser:Logging:Level` is passed via environment variables so util + API suites log identically.

### 4.3 `RUN_DEMOAPP003_TYPESCRIPT_PLAYWRIGHT_API_AND_TESTS.BAT`

- **Port**: 3001 (`http://localhost:3001`).
- **Util suite**: `npm run test:bdd -- --tags @UTILTEST`.
- **API suite**: `npm run test:bdd`.
- **API start**: `npm run start` with readiness check using `Test-NetConnection`.
- **Logs**: `.results/demoapp003_typescript_playwright_util_<UTC>.txt` and `.results/demoapp003_typescript_playwright_<UTC>.txt`.
- **Notes**: Exposes `PLAYWRIGHT_TEST_BASE_URL` and the Screenplay-specific `API_BASE_URL` prior to invoking Cucumber to align with TypeScript hooks.

### 4.4 `RUN_DEMOAPP004_PYTHON_PLAYWRIGHT_API_AND_TESTS.BAT`

- **Port**: 3002 (`http://localhost:3002`).
- **Util suite**: `python -m pytest -m util`.
- **API suite**: `python -m pytest -m api`.
- **API start**: `python -m src.server` launched in a detached `cmd.exe` session, readiness polled via `Test-NetConnection`.
- **Docs**: Automatically opens `%API_BASE_URL%/docs` when it starts the FastAPI host.
- **Logs**: `.results/demoapp004_python_playwright_util_<UTC>.txt` and `.results/demoapp004_python_playwright_<UTC>.txt`.
- **Notes**: Shares helper fragments `RUN_API.bat` and `RUN_TESTS.bat` inside the Python stack, but this runner remains the canonical entry point for the orchestrator.

---

## 5. Metrics Artefacts

Each orchestrated run produces three artefacts located under `.results/`:

### 5.1 Raw Metrics - `.metrics`

Plain text key/value pairs (one per line) used as input for renderers:

```
Cypress_Exit=0
Cypress_Log=D:\repo\.results\demoapp001_typescript_cypress_20251118T1406Z.txt
PlaywrightTS_Exit=0
PlaywrightTS_Log=D:\repo\.results\demoapp003_typescript_playwright_20251118T1407Z.txt
DotNetPlaywright_Exit=0
DotNetPlaywright_Log=D:\repo\.results\demoapp002_csharp_playwright_20251118T1408Z.txt
PlaywrightPY_Exit=0
PlaywrightPY_Log=D:\repo\.results\demoapp004_python_playwright_20251118T1409Z.txt
OverallExit=0
```

- Suite labels must be unique and must not contain whitespace.
- Exit codes are written immediately after each runner completes.
- Log paths are absolute so downstream tooling can fetch artefacts regardless of working directory.
- The trailing `OverallExit` entry is mandatory.

### 5.2 ASCII Summary - `.txt`

`render-run-metrics.ps1` parses the raw file, inspects each referenced log, and emits an aligned table suitable for console or build logs. Columns include Suite, Exit, Tests, Passed, Failed, Skipped, Duration, and Log Path. Missing logs appear as `-` with `unavailable`.

### 5.3 Markdown Summary - `.md`

The renderer also outputs a Markdown table with the same columns. This file is designed for PR comments or Confluence pastes - no additional formatting is required.

### 5.4 Renderer Behaviour

The renderer:

1. Validates that every `<suite>_Exit` has a matching `<suite>_Log`.
2. Attempts to parse each log using stack-specific heuristics (Cypress JSON summary, Playwright reporters, pytest output, or SpecFlow TRX summaries).
3. Falls back to `-` when counts are unavailable so consumers can detect incomplete artefacts.

Any change to log formats must be reflected in `render-run-metrics.ps1` and recorded in this document.

---

## 6. Adding or Modifying Runners

1. Copy the closest existing runner as a template.
2. Update `APP_DIR`, port defaults, util/API commands, and log prefixes.
3. Register the runner inside `RUN_ALL_API_AND_TESTS.BAT` (maintaining util-first ordering) and, when relevant, the warm-up script.
4. Update the per-stack README, the root README, and `new_demo_requirements.md`.
5. Add or adjust parsing logic in `render-run-metrics.ps1` if log formats differ.
6. Update this document's version/date along with summary bullets in the repo CHANGELOG (or PR description).

---

## 7. Execution Sequence Snapshot

1. Developer or CI triggers `.batch/RUN_ALL_API_AND_TESTS.BAT`.
2. The orchestrator sequentially calls each runner, ensuring `.env` overrides, API lifecycle management, util-first ordering, and log creation are consistent.
3. The renderer builds `.metrics`, `.txt`, and `.md` summaries tied to the UTC identifier.
4. `.batch/RUN_ALL_APIS_AND_SWAGGER.BAT` remains available for manual verification and mirrors the same API boot logic, guaranteeing no drift between manual and automated flows.

This closed loop keeps diagnostics predictable, aligns Screenplay hooks across stacks (via shared `API_BASE_URL` handling), and guarantees that future demo projects inherit a tested automation foundation.
