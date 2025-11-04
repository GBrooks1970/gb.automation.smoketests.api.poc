# C#/SpecFlow/Playwright - TOKENPARSER API

**Version 1 - [04/11/25]**

The .NET 8 minimal API in `_API_TESTING_GHERKIN_/DEMOAPP002_CSHARP_PLAYWRIGHT/TokenParserAPI` hosts the **TOKENPARSER API** on `http://localhost:5228`. Swagger UI is enabled and the service is validated with SpecFlow + Playwright end-to-end tests.

---

## TOKENPARSER API Endpoints

### 1. GET `/alive`

- Purpose: Confirms the API host is running.
- Success (200):

  ```json
  { "Status": "ALIVE-AND-KICKING" }
  ```

### 2. GET `/parse-dynamic-string-token`

- Query: `token` (string, required) — formatted as `[ALPHA|NUMERIC|PUNCTUATION|SPECIAL]-LEN-<length>[-LINES-<count>]`.
- Purpose: Generates strings using the requested character sets and optional multi-line output.
- Success (200): Returns the generated value.

  ```json
  { "ParsedToken": "ABcd1234" }
  ```

- Error (400): Invalid token format or line configuration.

  ```json
  { "Error": "Invalid string token format" }
  ```

### 3. GET `/parse-date-token`

- Query: `token` (string, required) — describes relative or range-based dates.
- Purpose: Parses the token and returns the computed UTC date/time.
- Success (200): Date is emitted using the `yyyy-MM-dd HH:mm:ssZ` format.

  ```json
  { "ParsedToken": "2025-11-04 00:00:00Z" }
  ```

- Error (400): Invalid token structure or parameters.

  ```json
  { "Error": "Invalid string token format" }
  ```

---

## Swagger / OpenAPI

- Swagger UI: `http://localhost:5228/swagger`
- Raw OpenAPI JSON: `http://localhost:5228/swagger/v1/swagger.json`
- Raw OpenAPI YAML: `http://localhost:5228/swagger/v1/swagger.yaml`

---

## Included Artifacts

This solution contains:

- Minimal API entry point (`Program.cs`) with Swagger configuration.
- Token parsing utilities for date and dynamic string tokens.
- SpecFlow feature files and Playwright bindings that validate API behaviour.
- Batch scripts that start the API and execute the Playwright test suite.

---

## Repository

Source code is stored in Bitbucket:

[UCAS Automation Smoke Tests API POC - dev/MDT-automation-base](https://bitbucket.org/UCAS/ucas.automation.smoketests.api.poc/branch/dev/MDT-automation-base)
