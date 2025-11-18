# QA Strategy – DEMOAPP002 (C# + SpecFlow + Playwright)

**Version 2 – 18/11/25**

## 1. Goals
1. Provide a .NET validation layer for the Token Parser API that mirrors the TypeScript stacks.
2. Keep SpecFlow feature files, examples, and expected payloads identical to DEMOAPP001/003/004.
3. Deliver deterministic logs/metrics for `.batch/RUN_ALL_API_AND_TESTS.BAT`.

## 2. Test Portfolio
| Layer | Coverage | Tooling | Notes |
| --- | --- | --- | --- |
| Static analysis | Formatting, analyzers | `dotnet format`, Roslyn rules via `.editorconfig` | Run before committing. |
| Component | Parser utilities | Unit tests (roadmap) + direct invocation in steps | Align with shared parser logic. |
| Util Scenarios | Parser behaviour w/out HTTP | SpecFlow scenarios tagged `@utiltests` | Executed first in batch runs. |
| API Scenarios | `/alive`, `/parse-date-token`, `/parse-dynamic-string-token` | SpecFlow + Playwright `RequestHelper_PW` | Use `API_BASE_URL` from `.env`. |
| Integration | API start/stop, Swagger check | `.batch/RUN_ALL_APIS_AND_SWAGGER.BAT` | Ensures Windows automation parity. |

## 3. Quality Gates
1. `dotnet restore && dotnet build` (fail fast on compiler warnings).
2. `dotnet format --verify-no-changes` + analyzers.
3. `dotnet test TokenParserTests --filter "TestCategory=utiltests"` (util focus).
4. `dotnet test TokenParserTests --no-build` (full suite).
5. `.batch/RUN_DEMOAPP002_CSHARP_PLAYWRIGHT_API_AND_TESTS.BAT` (util + api + Swagger launch).
6. Repository orchestrator `.batch/RUN_ALL_API_AND_TESTS.BAT`.

## 4. Metrics
- **Suite Counts**: Captured in `.results/run_metrics_<UTC>.txt` with `.NET Playwright` label.
- **Exit Codes**: Each batch invocation records `<Label>_Exit=<code>`; keep `0` before merging.
- **Parity Lag**: Use `API Testing POC/DEMO_DOCS/Backlog_Parity.md` to log pending SpecFlow updates after TypeScript changes.
- **Flake Tracking**: Record reruns in pipeline logs; target <2% rerun rate.

## 5. Risks & Mitigations
| Risk | Mitigation |
| --- | --- |
| Date token drift vs TS stacks | Reuse shared Scenario Outline data and `DateFormatting.CanonicalFormat`. |
| HTTP helper nullability | Request helpers now guard against null responses (see Helpers folder). |
| Environment skew (Playwright install missing) | `RUN_TESTS.bat` checks for browsers and guides developers to run `npx playwright install`. |
| Swagger contract drift | Run `.batch/RUN_ALL_APIS_AND_SWAGGER.BAT` before publishing contract doc updates. |

## 6. Execution Recipes
### Local
```
dotnet restore
dotnet format
dotnet test TokenParserTests --filter "TestCategory=utiltests"
dotnet test TokenParserTests
```
Optional: `RUN_API.bat` and `RUN_TESTS.bat` wrappers for a single command loop.

### CI
- Pipeline steps: `dotnet build`, `dotnet format --verify-no-changes`, `dotnet test --logger trx --results-directory TokenParserTests/TestResults`.
- Publish `.trx` files and `.results/*.txt` for diagnostics.

## 7. Next Improvements
1. Add FluentAssertions-based contract checks that compare responses to the documented schema.
2. Capture Playwright traces for failing API requests.
3. Introduce SpecFlow living documentation output to show parity state in CI.
4. Expand unit tests around random token generation (now using `RandomNumberGenerator`).
