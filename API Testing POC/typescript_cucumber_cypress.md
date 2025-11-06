# Typescript/Cucumber/Cypress - TOKENPARSER API

**Version 1 - [04/11/25]**

The TypeScript Express server in `_API_TESTING_GHERKIN_/DEMOAPP001_TYPESCRIPT_CYPRESS` hosts the **TOKENPARSER API** on `http://localhost:3000`. It exposes Swagger UI and is validated through Cypress + Cucumber BDD tests.

---

## TOKENPARSER API Endpoints

### 1. GET `/alive`

- Purpose: Lightweight health check for the API host.
- Success (200):

  ```json
  { "Status": "ALIVE-AND-KICKING" }
  ```

### 2. GET `/parse-dynamic-string-token`

- Query: `token` (string, required) - dynamic string token in the `[TYPE]-LEN-<length>[-LINES-<count>]` format.
- Purpose: Generates a random string that matches the requested token rules (character sets and optional multi-line output).
- Success (200): Returns the generated string.

  ```json
  { "ParsedToken": "ABcd1234" }
  ```

- Error (400): Missing or invalid token.

  ```json
  { "Error": "TokenDynamicStringParser : Invalid string token format : <token>" }
  ```

### 3. GET `/parse-date-token`

- Query: `token` (string, required) - date token describing offsets or ranges.
- Purpose: Parses the supplied token and returns a UTC timestamp that honours the rules encoded in the token.
- Success (200): Timestamp is normalised to `yyyy-MM-dd HH:mm:ssZ`.

  ```json
  { "ParsedToken": "2025-11-04 00:00:00Z" }
  ```

- Error (400): Invalid or missing token.

  ```json
  { "Error": "TokenDateParser.parseDateStringToken : Invalid string token format : <token>" }
  ```

---

## Swagger / OpenAPI

- Swagger UI: `http://localhost:3000/swagger/v1/json`
- Raw OpenAPI JSON: `http://localhost:3000/swagger/v1/swagger.json`
- Raw OpenAPI YAML: `http://localhost:3000/swagger/v1/swagger.yaml`

---

## Included Artifacts

This proof of concept provides:

- Express server implementation (`src/server.ts`) with Swagger configuration.
- Token parsing utilities for dates and dynamic strings.
- Cucumber feature files and Cypress step definitions that exercise the API.
- Batch scripts to start the API and run the Cypress suite, capturing results.

---

## Repository

Source code is stored in Bitbucket:

[UCAS Automation Smoke Tests API POC - dev/MDT-automation-base](https://bitbucket.org/UCAS/ucas.automation.smoketests.api.poc/branch/dev/MDT-automation-base)

