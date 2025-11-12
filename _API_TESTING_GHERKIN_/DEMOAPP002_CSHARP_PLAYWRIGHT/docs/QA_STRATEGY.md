# QA Strategy for DEMOAPP002 (C# Playwright/SpecFlow)

**Version 1 - [12/11/25]**

## Purpose
Ensure the .NET reference stack protecting the Token Parser API remains in lock-step with the TypeScript suites while embracing ISTQB-aligned practices (risk analysis, verification gates, and traceability).

## Guiding Principles
1. **Parity Coverage** – feature wording, examples, and expected payloads must match DEMOAPP001/003 to keep Screenplay parity metrics honest.
2. **Shift-Left Verification** – `dotnet format`, analyzers, and `dotnet test` run locally before pushing changes; CI mirrors the same workflow.
3. **Risk-Based Prioritisation** – date parsing and dynamic string tokens are treated as high risk; health checks and low-impact endpoints receive smoke-only coverage.
4. **Deterministic Data** – SpecFlow helpers normalise UTC output and limit flakiness (e.g., `AssertRelativeDate` using `DateTime.Today`).
5. **Observability & Reporting** – TRX outputs (`TokenParserTests/TestResults/*.trx`) and any Playwright traces should be attached to CI runs for rapid diagnostics.

## Test Levels & Scope
| Level | Goal | Execution |
| --- | --- | --- |
| Component | Validate parser services in isolation | .NET unit tests (to be expanded) + direct invocation inside SpecFlow steps |
| API / Contract | Confirm endpoints return correct status/body | SpecFlow scenarios invoking `RequestHelper` |
| Integration | Ensure Express-equivalent host is wired to services & config | `.batch/RUN_ALL_APIS_AND_SWAGGER.BAT` starts this API alongside TS servers |
| UI / e2e (future) | Browser validation | Placeholder Playwright bindings; enable once UI exists |

## Tooling & Gates
- **Static Analysis**: `dotnet format --verify-no-changes` + Roslyn analyzers (enable in `.editorconfig`) before merging.
- **Unit/BDD Tests**: `dotnet test` with `--logger "trx"` to collect results; reruns allowed to root-cause flaky behaviour.
- **Playwright Assets**: `npx playwright install` invoked from `RUN_TESTS.bat` when tests require browsers.
- **Batch Harness**: `RUN_API.bat` + `RUN_TESTS.bat` provide consistent local repro steps and feed into `.batch/RUN_ALL_APIS_AND_SWAGGER.BAT` for cross-stack runs.

## Execution Matrix
- **Local**:
  1. `dotnet restore`
  2. `dotnet format`
  3. `dotnet test TokenParserTests`
  4. If UI steps are added, run `npx playwright test` and capture traces.
- **CI**:
  - Use `dotnet build --configuration Release`, `dotnet format --verify-no-changes`, and `dotnet test --logger trx --results-directory TokenParserTests/TestResults`.
  - Publish `.trx` plus Playwright artifacts.
- **Cross-Stack Smoke**:
  - Run repository-level `.batch/RUN_ALL_APIS_AND_SWAGGER.BAT` after changing ports/env values to ensure the PowerShell harness still starts/stops the C# API cleanly.

## Risk Matrix
| Tier | Examples | Mitigation |
| --- | --- | --- |
| High | `/parse-date-token`, `/parse-dynamic-string-token`, Swagger contracts | Automated SpecFlow scenarios + nightly regression runs |
| Medium | `/alive` health, logging middlewares | Smoke coverage + monitoring hooks |
| Low | Static files, doc endpoints | Manual verifications |

## Metrics
- **Automation Rate**: % of feature files with executable steps vs. backlog.
- **Flake %**: number of rerun scenarios / total executed (target <2%).
- **Lead Time**: time between API change and updated parity across all stacks (tracked in `API Testing POC/screenplay_parity_typescript.md`).

## Open Improvements
1. Introduce Screenplay-friendly abstractions (actors/abilities) in C# to align with the TypeScript docs (see `docs/SCREENPLAY_GUIDE.md`).
2. Add contract checks against the Swagger schema using FluentAssertions + Swashbuckle-generated clients.
3. Wire Playwright traces/snapshots into SpecFlow hooks for richer diagnostics once UI flows exist.
