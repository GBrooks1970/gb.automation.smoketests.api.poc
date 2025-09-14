# README

This repository is a small proof-of-concept workspace for API automation and smoke tests using different stacks (TypeScript + Cypress and C# + Playwright). Below is a concise overview of the repository layout and a short description of each folder / project with pointers to key files.

Repository root

- [README.md](README.md) (this file)
- [_API_TESTING_GHERKIN_](./_API_TESTING_GHERKIN_/)

Top-level demos: [_API_TESTING_GHERKIN_/](./_API_TESTING_GHERKIN_/)

- DEMOAPP001_TYPESCRIPT_CYPRESS/ — TypeScript + Cypress demo
  - Key files
    - [`cypress.config.ts`](./_API_TESTING_GHERKIN_/DEMOAPP001_TYPESCRIPT_CYPRESS/cypress.config.ts)
    - [`package.json`](./_API_TESTING_GHERKIN_/DEMOAPP001_TYPESCRIPT_CYPRESS/package.json)
    - [`tsconfig.json`](./_API_TESTING_GHERKIN_/DEMOAPP001_TYPESCRIPT_CYPRESS/tsconfig.json)
  - Source layout
    - [`cypress/`](./_API_TESTING_GHERKIN_/DEMOAPP001_TYPESCRIPT_CYPRESS/cypress/) — Cypress tests, fixtures and support files
    - [`src/server.ts`](./_API_TESTING_GHERKIN_/DEMOAPP001_TYPESCRIPT_CYPRESS/src/server.ts) — demo API server entry
    - [`src/services/`](./_API_TESTING_GHERKIN_/DEMOAPP001_TYPESCRIPT_CYPRESS/src/services/) — service modules used by the demo API
    - [`src/tokenparser/`](./_API_TESTING_GHERKIN_/DEMOAPP001_TYPESCRIPT_CYPRESS/src/tokenparser/) — token parsing logic used by tests
  - Notes
    - Inspect [`package.json`](./_API_TESTING_GHERKIN_/DEMOAPP001_TYPESCRIPT_CYPRESS/package.json) for available npm scripts (start, test, build).
    - Typical workflow: install deps in the demo (`npm install`) and run Cypress via npm scripts or `npx cypress`.

- DEMOAPP002_CSHARP_PLAYWRIGHT/ — C# / .NET demo using Playwright and NUnit
  - Top-level files
    - [`TokenParserAPI.sln`](./_API_TESTING_GHERKIN_/DEMOAPP002_CSHARP_PLAYWRIGHT/TokenParserAPI.sln) — Visual Studio solution
    - [`RUN_API.bat`](./_API_TESTING_GHERKIN_/DEMOAPP002_CSHARP_PLAYWRIGHT/RUN_API.bat) — convenience batch to run the API
    - [`RUN_TESTS.bat`](./_API_TESTING_GHERKIN_/DEMOAPP002_CSHARP_PLAYWRIGHT/RUN_TESTS.bat) — convenience batch to run tests
  - Projects
    - [`TokenParserAPI/`](./_API_TESTING_GHERKIN_/DEMOAPP002_CSHARP_PLAYWRIGHT/TokenParserAPI/) — ASP.NET/.NET API project
      - Contains configuration and application code (e.g. `appsettings.Development.json`) and a typical .NET project layout.
      - Build artifacts and Playwright runtime files may appear under `bin/` and `obj/` (e.g. see `obj/Debug/net8.0/TokenParserAPI.csproj.FileListAbsolute.txt` and `.playwright` entries).
      - Inspect the project NuGet spec files under `obj/` for referenced packages (`project.assets.json` etc).
      - Key paths: [`TokenParserAPI/`](./_API_TESTING_GHERKIN_/DEMOAPP002_CSHARP_PLAYWRIGHT/TokenParserAPI/)
    - [`TokenParserTests/`](./_API_TESTING_GHERKIN_/DEMOAPP002_CSHARP_PLAYWRIGHT/TokenParserTests/) — test project
      - Uses NUnit + Microsoft.Playwright for browser-driven tests and SpecFlow in some setups (see package references in `obj/project.assets.json`).
      - Key files include the test project file and generated `obj/` metadata (`obj/project.assets.json`, `obj/Debug/net8.0/TokenParserTests.csproj.FileListAbsolute.txt`).
      - Key path: [`TokenParserTests/`](./_API_TESTING_GHERKIN_/DEMOAPP002_CSHARP_PLAYWRIGHT/TokenParserTests/)
  - Notes
    - Open the solution [`TokenParserAPI.sln`](./_API_TESTING_GHERKIN_/DEMOAPP002_CSHARP_PLAYWRIGHT/TokenParserAPI.sln) in Visual Studio or run the included batch scripts:
      - Start API: [`RUN_API.bat`](./_API_TESTING_GHERKIN_/DEMOAPP002_CSHARP_PLAYWRIGHT/RUN_API.bat)
      - Run tests: [`RUN_TESTS.bat`](./_API_TESTING_GHERKIN_/DEMOAPP002_CSHARP_PLAYWRIGHT/RUN_TESTS.bat)
    - The test project references the API project as a project dependency (see `TokenParserTests/obj/...`).

Build / run notes (brief)

- TypeScript demo
  - cd into [_API_TESTING_GHERKIN_/DEMOAPP001_TYPESCRIPT_CYPRESS/](./_API_TESTING_GHERKIN_/DEMOAPP001_TYPESCRIPT_CYPRESS/)
  - Inspect [`package.json`](./_API_TESTING_GHERKIN_/DEMOAPP001_TYPESCRIPT_CYPRESS/package.json) for scripts. Typical steps: `npm install` then `npm run <script>` or `npx cypress open`.
- .NET demo
  - Open [`TokenParserAPI.sln`](./_API_TESTING_GHERKIN_/DEMOAPP002_CSHARP_PLAYWRIGHT/TokenParserAPI.sln) in Visual Studio / Rider or run the batch files:
    - [`RUN_API.bat`](./_API_TESTING_GHERKIN_/DEMOAPP002_CSHARP_PLAYWRIGHT/RUN_API.bat)
    - [`RUN_TESTS.bat`](./_API_TESTING_GHERKIN_/DEMOAPP002_CSHARP_PLAYWRIGHT/RUN_TESTS.bat)
  - Tests use NUnit and Playwright; dependencies and runtime browser bundles can appear under `bin/Debug/net8.0/.playwright/` (see `obj` and `bin` listings).

What to ignore (build artifacts)

- Many `obj/`, `bin/`, and `.playwright/` files are build artifacts. NuGet packages and generated files are under `*/obj/` and `*/bin/`. Use [.gitignore](.gitignore) to avoid committing them.

Where to look next

- TypeScript demo entry: [`_API_TESTING_GHERKIN_/DEMOAPP001_TYPESCRIPT_CYPRESS/src/server.ts`](./_API_TESTING_GHERKIN_/DEMOAPP001_TYPESCRIPT_CYPRESS/src/server.ts)
- Cypress tests: [`_API_TESTING_GHERKIN_/DEMOAPP001_TYPESCRIPT_CYPRESS/cypress/`](./_API_TESTING_GHERKIN_/DEMOAPP001_TYPESCRIPT_CYPRESS/cypress/)
- C# solution: [`_API_TESTING_GHERKIN_/DEMOAPP002_CSHARP_PLAYWRIGHT/TokenParserAPI.sln`](./_API_TESTING_GHERKIN_/DEMOAPP002_CSHARP_PLAYWRIGHT/TokenParserAPI.sln)
- C# API project: [`_API_TESTING_GHERKIN_/DEMOAPP002_CSHARP_PLAYWRIGHT/TokenParserAPI/`](./_API_TESTING_GHERKIN_/DEMOAPP002_CSHARP_PLAYWRIGHT/TokenParserAPI/)
- C# tests: [`_API_TESTING_GHERKIN_/DEMOAPP002_CSHARP_PLAYWRIGHT/TokenParserTests/`](./_API_TESTING_GHERKIN_/DEMOAPP002_CSHARP_PLAYWRIGHT/TokenParserTests/)
