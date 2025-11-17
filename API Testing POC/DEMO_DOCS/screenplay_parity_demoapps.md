# Screenplay Parity - DEMOAPP Stacks

**Version 2 - 17/11/25**

This document is the single source of truth for how the Screenplay pattern is implemented across every demo stack. Use it to verify parity, identify drift, and guide new DEMOAPP contributions.

---

## 1. Screenplay Contract

Every stack must satisfy the following contract. Any deviation must be documented here and in the per-project docs.

| Area | Expectations |
| --- | --- |
| Actors | One actor per scenario, created in hooks/fixtures. Names should reflect the persona (for example `Cypress API Actor`). |
| Abilities | `CallAnApi` (HTTP client wrapper) and `UseTokenParsers` (shared parser helpers) are mandatory. Additional abilities are optional extensions. |
| Tasks | `SendGetRequest` accepts a path and optional query params. Util tasks must reuse shared parser modules so no stack reimplements parsing logic. |
| Questions | `ResponseStatus`, `ResponseBody`, and util memory helpers read from consistent keys such as `LAST_RESPONSE`. |
| Memory Keys | Shared constants define keys like `LAST_RESPONSE`, `LAST_PARSED_DATE`, `LAST_UTIL_RESULT`. Hard-coded strings are prohibited. |
| Hooks / Fixtures | Scenario hooks ensure abilities exist, dispose HTTP clients, and reset memory between scenarios. |
| Feature Tags | Util scenarios must be filterable (`@UTILTEST`, `@util`, or SpecFlow categories). API scenarios are untagged or use `@API`. |
| Documentation | Each DEMOAPP keeps architecture / QA / Screenplay docs under its `docs/` folder. Updates here must reference those files. |

---

## 2. DEMOAPP001 - TypeScript + Cypress

- Actors: `screenplay/core/api-world.ts` and `screenplay/core/util-world.ts` create dedicated actors per scenario.
- Abilities: `CallAnApi` (wraps `cy.request`) and `UseTokenParsers` (TypeScript parser modules).
- Tasks: `SendGetRequest` returns a Cypress chain; util steps call parser helpers directly.
- Questions / Memory: `ResponseStatus`, `ResponseBody`, and `UtilActorMemory` read/write shared keys defined in `screenplay/support/memory-keys.ts`.
- Hooks: Cypress Cucumber hooks spin up actors for both API and util tags and dispose abilities after each scenario.
- Tags: Util scenarios are tagged `@UTILTEST` and API suites run without filters by default.

Parity status: this stack is the reference dataset for feature tables (seven date rows, six dynamic rows, and range coverage). Other stacks must match its Gherkin tables exactly.

---

## 3. DEMOAPP003 - TypeScript + Playwright BDD

- Actors: `screenplay/core/custom-world.ts` instantiates `Actor.named("Playwright API Tester")`.
- Abilities: `CallAnApi` uses Playwright `APIRequestContext`; `UseTokenParsers` shares parser modules from `src/tokenparser`.
- Tasks: `SendGetRequest` is async/await friendly and writes the Playwright `APIResponse` to actor memory.
- Questions / Memory: Reuse the same `memory-keys.ts` and `UtilActorMemory` helpers as DEMOAPP001.
- Hooks: World hooks enable and dispose the Playwright request context per scenario.
- Tags: Util scenarios retain the `@UTILTEST` tag, so the batch runner can execute util tests first.

Parity status: matches DEMOAPP001 for scenarios, actors, and memory keys. When TypeScript Screenplay APIs change, update both stacks together.

---

## 4. DEMOAPP002 - .NET + SpecFlow + Playwright

- Actors: `TokenParserTests/Screenplay/Support/ScreenplayHooks.cs` creates actors in `[BeforeScenario]` and stores them in the SpecFlow `ScenarioContext`.
- Abilities: `.NET` versions of `CallAnApi` (Playwright .NET request client) and `UseTokenParsers` (shared C# parser classes).
- Tasks: Implemented under `TokenParserTests/Screenplay/Tasks/*.cs`, mirroring the TypeScript task names.
- Questions / Memory: Question classes fetch values from `TokenParserTests/Screenplay/Support/MemoryKeys.cs` to keep naming in sync.
- Hooks: `[AfterScenario]` disposes HTTP clients and clears memory.
- Tags: Util specs use `[Category("utiltests")]`, allowing the batch runner to target util-only coverage.

Parity status: fully Screenplay-aligned as of November 2025. When new tasks or memory keys are added, update this stack alongside the TypeScript and Python projects.

---

## 5. DEMOAPP004 - Python + FastAPI + pytest-bdd

- Actors: `tests/conftest.py` exposes a pytest fixture that creates `Actor("Python API Tester")`.
- Abilities: `screenplay/abilities/call_an_api.py` wraps `APIRequestContext`; `screenplay/abilities/use_token_parsers.py` exposes the parser helpers under `src/tokenparser`.
- Tasks: `screenplay/tasks/send_get_request.py` mirrors the TypeScript API. `screenplay/tasks/parse_token_locally.py` performs util parsing and stores values in actor memory.
- Questions / Memory: `screenplay/questions/response_status.py` and `response_body.py` read from `MemoryKeys.LAST_RESPONSE`; `screenplay/support/memory_keys.py` mirrors the TypeScript keys.
- Hooks: pytest-bdd currently uses fixtures rather than explicit `before_scenario` hooks. The backlog item below covers finishing the `features/step_definitions/world.py` hook to match other stacks.
- Tags: Features use `@api` and `@util`, and the batch runner maps those tags to `pytest -m api` and `pytest -m util`.

Parity status: API and util Screenplay tasks match the other stacks. Remaining work is to align feature tables and make the `world.py` hook instantiate abilities before each scenario (tracked in the backlog).

---

## 6. Parity Checklist

| Contract Item | Cypress | Playwright TS | SpecFlow .NET | Playwright PY | Notes |
| --- | --- | --- | --- | --- | --- |
| Actor per scenario | Yes | Yes | Yes | Yes | Python hook integration is partially fixture-based. |
| `CallAnApi` ability | Yes | Yes | Yes | Yes | Uses environment-driven base URLs everywhere. |
| `UseTokenParsers` ability | Yes | Yes | Yes | Yes | All stacks reuse their local parser ports. |
| `SendGetRequest` task | Yes | Yes | Yes | Yes | Names and responsibilities match. |
| Response questions | Yes | Yes | Yes | Yes | Store `APIResponse` instances in shared memory keys. |
| Shared memory keys | Yes | Yes | Yes | Yes | Keys must remain identical strings. |
| Util/API tagging | `@UTILTEST` | `@UTILTEST` | `Category=utiltests` | `@util` / `@api` | Python tags are already mapped in the batch runner. |
| Screenplay docs | `docs/SCREENPLAY_GUIDE.md` | `docs/SCREENPLAY_GUIDE.md` | Screenplay section in docs | `docs/SCREENPLAY_GUIDE.md` | Keep these files in sync with this spec. |

---

## 7. Backlog

1. Populate DEMOAPP002/003/004 feature tables from the DEMOAPP001 source data to eliminate coverage drift.
2. Finish `features/step_definitions/world.py` in DEMOAPP004 so actor setup happens through pytest-bdd hooks instead of relying solely on fixtures.
3. Add a CI check that diffs `screenplay/**` folders (abilities, tasks, questions) across repos to alert on drift.
4. Move Scenario Outline data into a shared JSON or YAML resource consumed by every stack.
5. Document future ability/task additions here and in the per-stack docs whenever new workflows are introduced.

---

## 8. References

- `_API_TESTING_GHERKIN_/DEMOAPP001_TYPESCRIPT_CYPRESS/docs/SCREENPLAY_GUIDE.md`
- `_API_TESTING_GHERKIN_/DEMOAPP002_CSHARP_PLAYWRIGHT/docs/QA_STRATEGY.md` (Screenplay section)
- `_API_TESTING_GHERKIN_/DEMOAPP003_TYPESCRIPT_PLAYWRIGHT/docs/SCREENPLAY_GUIDE.md`
- `_API_TESTING_GHERKIN_/DEMOAPP004_PYTHON_PLAYWRIGHT/docs/SCREENPLAY_GUIDE.md`
- `API Testing POC/DEMO_DOCS/new_demo_requirements.md`
- `API Testing POC/DEMO_DOCS/batch_runner_design.md`

