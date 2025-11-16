# Screenplay Parity – DEMOAPP Stacks

**Version 1 – 16/11/25**

This note is the single source of truth for how all DEMOAPP stacks implement the Screenplay pattern. Use it to verify parity, identify gaps, and guide future demos.

---

## 1. Contract: Screenplay Pattern Expectations

Every stack must satisfy the following contract. Any deviation must be documented and justified here.

| Area | Expectations |
| --- | --- |
| **Actors** | One actor per scenario, created via world/fixture hooks. Actor names should reflect the test persona (e.g., “Cypress API Actor”). |
| **Abilities** | `CallAnApi` (HTTP client wrapper) and `UseTokenParsers` (shared parser helpers) must be attached. Additional abilities must be optional extensions. |
| **Tasks** | `SendGetRequest` accepts endpoint + optional params. Util tasks reuse shared parsers (no duplicate logic). Tasks return promises/futures in async runtimes. |
| **Questions** | `ResponseStatus`, `ResponseBody`, and helper memory utilities (e.g., `UtilActorMemory`) read from a consistent memory key (`LAST_RESPONSE`). |
| **Memory Keys** | Shared constants (TypeScript `memory-keys.ts`, Python equivalents) define keys like `LAST_RESPONSE`, `LAST_UTIL_RESULT`. Hard-coded strings are prohibited. |
| **Hooks / Fixtures** | Scenario hooks ensure abilities are available, dispose HTTP clients, and reset memory between scenarios. |
| **Feature Tags** | `@API` / `@UTILTEST` (TS), `@util` / `@api` (Python), SpecFlow categories must support util vs API filtering for batch scripts. |
| **Parity Docs** | Each stack keeps architecture + QA + Screenplay docs under `_API_TESTING_GHERKIN_/DEMOAPP###/docs/`. Updates here must cross-reference those files. |

---

## 2. DEMOAPP001 – TypeScript + Cypress

- **Actors**: Defined in `screenplay/actors/Actor.ts`; scenarios use `apiActor()` or `utilActor()` from `screenplay/core/*.ts`.
- **Abilities**: `CallAnApi` (wraps `cy.request` with base URL from env vars) and `UseTokenParsers` (TypeScript parser classes).
- **Tasks**: `SendGetRequest` issues Cypress command chains; util parsing steps reuse parser helpers located next to step definitions.
- **Questions**: `ResponseStatus`, `ResponseBody`, and `UtilActorMemory` read/write to `LAST_RESPONSE`, `LAST_PARSED_TOKEN`.
- **Hooks**: Custom worlds instantiate actors per scenario via the Cypress Cucumber preprocessor.
- **Coverage**: Feature tags `@API` and `@UTILTEST` align with batch runner filters.

**Parity Notes**
- Serves as the golden dataset for feature tables (7 date rows, 6 dynamic rows). Other stacks must match these tables exactly.
- Logging and memory helpers were initial source; keep changes backward compatible for ported stacks.

---

## 3. DEMOAPP003 – TypeScript + Playwright BDD

- **Actors**: `screenplay/core/custom-world.ts` instantiates `Actor.named("Playwright API Tester")`.
- **Abilities**: `CallAnApi` uses Playwright’s `APIRequestContext`; `UseTokenParsers` shares parser modules from `src/tokenparser`.
- **Tasks**: `SendGetRequest` is async/await; step defs await the task to complete before asserting.
- **Questions/Memories**: Reuse the same files as DEMOAPP001; `memory-keys.ts` lives under `screenplay/support/`.
- **Hooks**: World hooks create/dispose API request contexts per scenario. After hooks close contexts to avoid leaks.
- **Tags**: `@API` (default) and `@UTILTEST` used for util-only runs.

**Parity Notes**
- Maintains parity with DEMOAPP001 by design; all updates in one stack should be ported to the other simultaneously.
- Acts as the reference design for async/await implementations.

---

## 4. DEMOAPP002 – C# + SpecFlow + Playwright

- **Actors**: SpecFlow bindings instantiate Screenplay actors in hooks (`BeforeScenario`), attaching abilities via dependency injection helpers.
- **Abilities**: `.NET` versions of `CallAnApi` (Playwright .NET request client) and `UseTokenParsers` (shared C# utility classes).
- **Tasks**: Tasks represent SpecFlow step bindings (e.g., `SendGetRequest`) calling the abilities internally.
- **Questions**: Helper classes expose `LastResponse` and JSON parsing, mapping to constant keys to keep parity with TypeScript naming.
- **Hooks**: `BeforeScenario` creates actors; `AfterScenario` disposes Playwright contexts and clears memory.
- **Tags/Categories**: `[Category("utiltests")]` ensures util coverage can run independently.

**Parity Notes**
- Fully Screenplay-aligned since Nov 2025; treat this stack as the .NET reference implementation.
- Any future ability/task additions must be mirrored in TypeScript/Python once stabilized.

---

## 5. DEMOAPP004 – Python + Playwright + pytest-bdd

- **Actors**: Fixtures in `tests/conftest.py` create `Actor("Python API Tester")`.
- **Abilities**: `CallAnApi` wraps Playwright Python `APIRequestContext`; `UseTokenParsers` reuses ported parser classes under `src/tokenparser`.
- **Tasks**: `tests/screenplay/tasks/send_get_request.py` matches the TypeScript signature (endpoint + params). Additional util tasks live alongside the parsers.
- **Questions**: `tests/screenplay/questions/response_body.py` and `response_status.py` store/retrieve from shared memory keys (mirrors TypeScript names).
- **Memory**: Python constants align with TypeScript `memory-keys.ts`; do not invent new keys without updating all stacks.
- **Tags**: `@api` and `@util` decorate features; batch runner calls `pytest -m api` or `pytest -m util`.

**Parity Notes**
- Feature tables must stay synchronized with DEMOAPP001 (currently missing rows—see documentation backlog).
- Pytest configuration should be consolidated (`pytest.ini` vs `pyproject.toml`) to avoid configuration drift.

---

## 6. Parity Checklist

| Contract Item | Cypress | Playwright TS | SpecFlow/.NET | Playwright PY | Notes |
| --- | --- | --- | --- | --- | --- |
| Actor per scenario | ✅ | ✅ | ✅ | ✅ | |
| `CallAnApi` ability | ✅ (`cy.request`) | ✅ (Playwright JS) | ✅ (Playwright .NET) | ✅ (Playwright PY) | |
| `UseTokenParsers` ability | ✅ | ✅ | ✅ | ✅ | |
| `SendGetRequest` task | ✅ | ✅ | ✅ | ✅ | |
| Response questions | ✅ (`ResponseStatus`, `ResponseBody`) | ✅ | ✅ | ✅ | |
| Shared memory keys | ✅ (`memory-keys.ts`) | ✅ | ✅ (constants) | ✅ (Python module) | |
| Util/API tagging | ✅ (`@UTILTEST`) | ✅ (`@UTILTEST`) | ✅ (`Category=utiltests`) | ⚠️ (`@util` tag aligned, but docs must call out filter) | |
| Screenplay docs | ✅ (`docs/`) | ✅ (`docs/`) | ✅ (`docs/`) | ✅ (`docs/`) | |

⚠️ = needs follow-up alignment (see backlog).

---

## 7. Backlog / Next Steps

1. **Synchronize Feature Tables**: Copy DEMOAPP001 Scenario Outline rows into DEMOAPP002/003/004 to keep acceptance criteria identical.
2. **Consolidate Python Pytest Config**: Choose either `pytest.ini` or `[tool.pytest.ini_options]` to avoid log warnings and config drift.
3. **Parity CI Check**: Add a script that diffs Screenplay folders (actors/abilities/tasks/questions) across stacks to catch drift automatically.
4. **Shared Test Data Source**: Move the Scenario Outline tables into a shared YAML/JSON resource consumed by every stack, reducing manual copy errors.
5. **Document Ability Extensions**: When new abilities/tasks appear (e.g., token caching), update this file and the per-stack docs simultaneously.

---

## 8. References

- `_API_TESTING_GHERKIN_/DEMOAPP001_TYPESCRIPT_CYPRESS/docs/SCREENPLAY_GUIDE.md`
- `_API_TESTING_GHERKIN_/DEMOAPP003_TYPESCRIPT_PLAYWRIGHT/docs/SCREENPLAY_GUIDE.md`
- `_API_TESTING_GHERKIN_/DEMOAPP002_CSHARP_PLAYWRIGHT/docs/` (Screenplay section inside QA/Architecture docs)
- `_API_TESTING_GHERKIN_/DEMOAPP004_PYTHON_PLAYWRIGHT/docs/SCREENPLAY_GUIDE.md`
- `API Testing POC/DEMO_DOCS/new_demo_requirements.md`
- `API Testing POC/DEMO_DOCS/batch_runner_design.md`
