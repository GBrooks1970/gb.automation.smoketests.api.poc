# Typescript/Cucumber/Cypress - TOKENPARSER API

**Version 1 – [21/11/24]**

Typescript Server setup provides a fully functional **TOKENPARSER API** with three endpoints, documentation using Swagger, and testing using Cypress and Cucumber with BDD/Gherkin Test Cases.

---

## TOKENPARSER API Endpoints

### 1. Alive (GET)
**Purpose:** Health checker of the API.

- **Success:**
  - Status Code: `200`
  - Response Body:
    ```json
    { "Status": "ALIVE-AND-KICKING" }
    ```

### 2. Parse-dynamic-string-token (GET)
**Purpose:** Outputs a computed string from an input token string.

- **Success:**
  - Status Code: `200`
  - Response Body:
    ```json
    { "ParsedToken": "generatedstring" }
    ```
- **Error:**
  - Status Code: `400`
  - Response Body:
    ```json
    { "Error": "error message" }
    ```

### 3. Parse-date-token (GET)
**Purpose:** Outputs a computed date from an input token string.

- **Success:**
  - Status Code: `200`
  - Response Body:
    ```json
    { "ParsedToken": "generatedstring" }
    ```
- **Error:**
  - Status Code: `400`
  - Response Body:
    ```json
    { "Error": "error message" }
    ```

---

## Included Code Snippets
This proof-of-concept includes:

- **Alive Endpoint Server Code**
- **Swagger Definition**
- **BDD/Gherkin Feature File** containing basic test case scenarios
- **Step Implementation** of the Alive endpoint test case scenario
- **Instructions for Starting the API and Cypress**
- **Successful Execution Output** of the Alive Endpoint Feature
- **Swagger UI Output**

---

## Repository
The source code and project are stored in the following Bitbucket repository:

[UCAS Automation Smoke Tests API POC – dev/MDT-automation-base](https://bitbucket.org/UCAS/ucas.automation.smoketests.api.poc/branch/dev/MDT-automation-base)

