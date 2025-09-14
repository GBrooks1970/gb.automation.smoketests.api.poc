# DEMOAPP001_TYPESCRIPT_CYPRESS

Short description

- Small TypeScript demo API with Cypress-based API tests and smoke checks. Includes a minimal Express/Koa-like server, token parsing logic and example service modules used by the tests.

Key files / folders

- package.json — npm scripts (start, test, build)
- cypress.config.ts — Cypress configuration
- cypress/ — tests, fixtures and support
- src/server.ts — demo API entry point
- src/services/ — service modules used by the API
- src/tokenparser/ — token parsing logic used by tests

Prerequisites

- Node.js (recommended LTS)
- npm (bundled with Node.js)

How to run the API (Windows)

1. Open PowerShell or CMD.
2. Change to the project folder:
   - cd /d d:\_UCAS\ucas.automation.smoketests.api.poc\_API_TESTING_GHERKIN_\DEMOAPP001_TYPESCRIPT_CYPRESS
3. Install dependencies:
   - npm install
4. Start the API (uses the npm script exposed in package.json):
   - npm run start

How to run the test suite (Cypress)

- Interactive (desktop runner):
  - npx cypress open
- Headless (CI / terminal):
  - npx cypress run
- Or use the npm test script if provided:
  - npm run test

Notes

- Run the API first (step above) so tests target a running server, or configure tests to start the server as part of the test lifecycle.
- Check package.json for exact script names and any environment variables the server/tests expect.
