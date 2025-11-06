# DEMOAPP001_TYPESCRIPT_CYPRESS

TypeScript demo API that exposes token parsing endpoints, together with Cypress + Cucumber tests that exercise the same behaviours end to end.

## Repository Layout

- `package.json` - npm scripts (`start`, `test`) and dependencies.
- `src/server.ts` - Express entry point and Swagger wiring.
- `src/tokenparser/` - date and dynamic string token parsing logic used by the API and tests.
- `cypress/` - Cypress feature files, step definitions, and shared support code.
- `.batch/` - automation scripts (for example `RUN_API_AND_TESTS.BAT`).
- `.results/` - timestamped run artifacts written by automation.

## Prerequisites

- Node.js (use the current LTS release).
- npm (bundled with Node.js).

Install dependencies once per clone:

```bash
npm install
```

## Running the API

```bash
npm run start
```

This command starts the Express host on port `3000` and serves Swagger at `/swagger/v1/swagger.json` and `/swagger/v1/swagger.yaml`.

## Running Cypress Tests

| Mode        | Command              |
|-------------|----------------------|
| Interactive | `npx cypress open`   |
| Headless    | `npx cypress run`    |
| npm script  | `npm run test`       |

Make sure the API is available on port `3000` before running the tests, or use the automation script below which handles startup automatically.

## One-Step API + Test Run (Windows)

A helper script is provided at `.batch\RUN_API_AND_TESTS.BAT`. It:

1. Starts the API via `npm run start`.
2. Waits until port `3000` is reachable.
3. Executes the Cypress suite headlessly.
4. Captures stdout/stderr to `.results\cy_results_<UTC_TIMESTAMP>.txt`.
5. Stops the API process and exits with the Cypress status code.

Run it from a command prompt or PowerShell:

```bat
call .batch\RUN_API_AND_TESTS.BAT
```

Logs use UTC timestamps in `yyyyMMddTHHmmZ` format (for example `cy_results_20251104T1400Z.txt`).

## Additional Notes

- API responses that contain dates are normalised to UTC to avoid timezone drift between environments.
- Refer to the Cypress feature files in `cypress/integration` for example token strings and expected outputs.
- Update environment variables or ports in `src/server.ts` if you need to run multiple instances concurrently.

