# DEMOAPP002_CSHARP_PLAYWRIGHT

Short description

- C#/.NET demo API (TokenParserAPI) with Playwright + NUnit tests (TokenParserTests). The API implements token parsing endpoints and simple services; the test project contains automated checks and browser-driven smoke tests.

Contents

- TokenParserAPI/ - ASP.NET Core Web API project (controllers, services, appsettings)
- TokenParserTests/ - NUnit test project using Microsoft.Playwright and test helpers
- TokenParserAPI.sln - Visual Studio solution linking both projects
- RUN_API.bat, RUN_TESTS.bat - convenience scripts to start the API and run tests

Prerequisites

- .NET SDK (match project, e.g. .NET 8)
- PowerShell or CMD on Windows
- Optional: Visual Studio or Rider for IDE support
- Playwright browsers (installed when required by tests)

How to run the API (Windows)

1. Open PowerShell or CMD.
2. Change to the demo folder:
   - cd /d d:\_UCAS\ucas.automation.smoketests.api.poc\_API_TESTING_GHERKIN_\DEMOAPP002_CSHARP_PLAYWRIGHT
3. Restore and run the API:
   - dotnet restore
   - dotnet run --project TokenParserAPI
   - Or run the provided batch: RUN_API.bat

How to run the test suite (Playwright + NUnit)

- Basic:
  - dotnet test TokenParserTests
- If Playwright browsers are required:
  - npx playwright install
  - Ensure any test configuration (ports, env vars) matches the running API
- Or run the provided batch: RUN_TESTS.bat

Notes

- Start the API before running tests unless tests manage the server lifecycle.
- Inspect TokenParserAPI/appsettings.* and TokenParserTests configuration for ports and environment overrides.

