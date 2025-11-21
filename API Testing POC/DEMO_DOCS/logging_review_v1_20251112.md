Logging Design Review - Token Parser Stacks
Version 2 - 21/11/25

Positives
- Shared log-level configuration via `TOKENPARSER_LOG_LEVEL` keeps behaviour consistent across CLI/batch harnesses because both TypeScript servers now read from `packages/tokenparser-api-shared/src/config.ts`.
- Each stack wraps console logging behind a category-aware helper (`packages/tokenparser-api-shared/src/services/logger.ts` in Node and `_API_TESTING_GHERKIN_/DEMOAPP002_CSHARP_PLAYWRIGHT/TokenParserAPI/logging/TokenParserLogger.cs`), making it easy to apply refactors centrally.
- Log level still defaults to `debug`, reducing surprise during local debugging, yet can be dialled down for CI/batch runs.

Risks & Refactors
1. Risk: API endpoints only log startup messages (e.g., `packages/tokenparser-api-shared/src/server.ts`), so validation failures or parser exceptions never hit logs. Production incidents would leave no trace.
   - Refactor: Add structured `logger.info` entries on request start/finish and `logger.error` inside `catch` blocks (including token preview + stack trace). Consider middleware to log method, path, status, and latency for every request.
2. Risk: C# API also swallows parser exceptions and relies on `Results.BadRequest`, but the custom logger is not invoked in endpoints. With ASP.NET minimal APIs, diagnostics/telemetry providers never see domain errors.
   - Refactor: Inject `ILogger<TokenParser>` (or wrap `TokenParserLogger`) into endpoints and emit structured logs (event id, token snippet, exception details) before returning `BadRequest`. Alternatively, register global exception middleware that logs via the built-in logging pipeline.
3. Risk: Custom loggers (TS + C#) write plain strings to stdout/stderr without correlation IDs or JSON formatting, which makes aggregating logs (e.g., Elastic/Splunk) and cross-service tracing hard.
   - Refactor: Introduce structured logging (e.g., pino/winston for Node, Serilog/Microsoft.Extensions.Logging for .NET) and include fields such as `requestId`, `endpoint`, and `tokenType`. Wire Playwright/Cypress tests to emit the same IDs when calling the API so traces can be joined.
4. Risk: C# project bypasses ASP.NET's dependency-injected logging infrastructure by using a static `TokenParserLogger`, so settings like `Logging:LogLevel` or external providers are ignored. This limits observability and duplicates configuration between `appsettings` and environment variables.
   - Refactor: Replace `TokenParserLogger` with the built-in logging pipeline (`builder.Logging`) and have minimal APIs consume `ILogger`. Map `TOKENPARSER_LOG_LEVEL` to `.SetMinimumLevel()` so infrastructure (Application Insights, Seq) can be plugged in without code changes.
5. Risk: Batch scripts spin multiple APIs but do not capture or rotate log output, meaning long-lived runs can lose data or overwhelm the console buffer.
   - Refactor: Redirect each API's stdout/stderr to timestamped log files under `.results/`, and optionally compress/clean older logs. Consider adding a lightweight log viewer or shipping logs to a centralized sink when running parity suites.
