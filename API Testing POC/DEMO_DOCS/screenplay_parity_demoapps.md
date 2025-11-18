# Screenplay Parity - DEMOAPP Stacks

**Version 3 - 18/11/25**

This document defines the Screenplay contract that applies to every demo stack (Cypress TypeScript, .NET SpecFlow, Playwright TypeScript, FastAPI + Playwright Python). It is the source of truth for actors, abilities, memory keys, feature data, and documentation requirements. New demos must implement the same contract before onboarding into the orchestrator.

---

## 1. Global Screenplay Contract

| Area | Expectations |
| --- | --- |
| Actor lifecycle | Exactly one actor per scenario, instantiated in hooks/world fixtures. Actor names describe the persona (for example "Playwright API Tester"). |
| Mandatory abilities | `CallAnApi` (HTTP client) and `UseTokenParsers` (local parser wrappers). Additional abilities must be documented here. |
| Mandatory tasks | `SendGetRequest` for API calls and a util parsing task that reuses the shared token parser module so parsing logic never diverges. |
| Questions | `ResponseStatus`, `ResponseBody`, and util memory helpers read from shared memory keys (see below). |
| Memory keys | The literal strings `LAST_RESPONSE`, `LAST_PARSED_DATE`, `LAST_PARSED_DYNAMIC`, `LAST_UTIL_RESULT` are reserved and must be defined via constants. |
| Hooks/fixtures | Before hooks initialise actors and abilities, after hooks dispose clients and reset memory. Fixtures must expose the same behaviour when the framework lacks native hooks. |
| Tagging | Util-table coverage must be filterable via tags/categories so batch runners can execute util suites first. API suites run without filters or use `@api`. |
| Documentation | Each stack keeps `docs/SCREENPLAY_GUIDE.md` (or a Screenplay section in QA docs). Updates to this spec require updating those files. |

---

## 2. Stack Implementations

### 2.1 DEMOAPP001 - TypeScript + Cypress

- Hooks: `screenplay/core/api-world.ts` and `util-world.ts` wire up actors before each scenario.
- Abilities: `screenplay/abilities/CallAnApi.ts` (wraps `cy.request`), `UseTokenParsers.ts`.
- Tasks & Questions: `SendGetRequest.ts`, `ResponseStatus.ts`, `ResponseBody.ts`, and util helpers live under `screenplay/tasks` and `screenplay/questions`.
- Memory: `screenplay/support/memory-keys.ts` plus `UtilActorMemory.ts`.
- Tagging: Util scenarios carry `@UTILTEST`.
- Canonical data: Feature tables in `cypress/e2e/features/tokenparser` are the authoritative set (seven date rows, six dynamic string rows).

### 2.2 DEMOAPP003 - TypeScript + Playwright BDD

- Hooks: `screenplay/core/custom-world.ts` aligns with the Cucumber world to instantiate `Actor.named("Playwright API Tester")`.
- Abilities/Tasks: Mirror the TypeScript Cypress stack but implemented with Playwright request contexts.
- Memory: Shares the same `memory-keys.ts` file by importing from `screenplay/support`.
- Tagging: Util scenarios keep the `@UTILTEST` tag.
- Coverage: Features under `features/tokenparser` are source-controlled copies of DEMOAPP001 tables and are re-verified whenever DEMOAPP001 changes.

### 2.3 DEMOAPP002 - .NET + SpecFlow + Playwright

- Hooks: `ScreenplayHooks.cs` uses `[BeforeScenario]` and `[AfterScenario]`.
- Abilities: `Abilities/CallAnApi.cs` (Playwright .NET request client) plus `Abilities/UseTokenParsers.cs`.
- Tasks & Questions: Located beneath `Screenplay/Tasks` and `Screenplay/Questions`; 1:1 naming with the TypeScript stacks.
- Memory: `Screenplay/Support/MemoryKeys.cs` matches the literal strings documented above.
- Tagging: Util specs labelled with `[Category("utiltests")]`.
- Coverage: Feature files mirror the canonical DEMOAPP001 tables; SpecFlow scenario outlines are regenerated when DEMOAPP001 changes.

### 2.4 DEMOAPP004 - Python + FastAPI + Playwright

- Hooks: `features/step_definitions/world.py` wires Screenplay actors in `pytest-bdd` hooks (fixtures previously filled the gap; hooks are now the default).
- Abilities: `screenplay/abilities/call_an_api.py` plus `use_token_parsers.py`.
- Tasks: `screenplay/tasks/send_get_request.py` and `parse_token_locally.py`.
- Questions & Memory: `screenplay/questions/response_status.py`, `response_body.py`, and shared constants in `screenplay/support/memory_keys.py`.
- Tagging: Util features flagged with `@util`; API features flagged with `@api`. Batch scripts map these to `pytest -m util` and `pytest -m api`.
- Coverage: Feature tables in `features/util/token_parser.feature` and `features/api/token_parser.feature` are copies of DEMOAPP001 (verified via CI parity check).

---

## 3. Cross-Stack Parity Matrix

| Contract Item | DEMOAPP001 (Cypress) | DEMOAPP003 (Playwright TS) | DEMOAPP002 (SpecFlow) | DEMOAPP004 (Playwright PY) | Notes |
| --- | --- | --- | --- | --- | --- |
| Actor per scenario | Yes (World hooks) | Yes (Cucumber world) | Yes (`BeforeScenario`) | Yes (`pytest-bdd` hooks) | All rely on the same persona naming guidance. |
| `CallAnApi` ability | Yes | Yes | Yes | Yes | Base URL injected through env vars created by `env_utils.bat`. |
| `UseTokenParsers` ability | Yes | Yes | Yes | Yes | Each stack imports its local parser port; no divergent logic. |
| `SendGetRequest` task | Yes | Yes | Yes | Yes | Implementation languages differ but responsibility matches. |
| Response questions | Yes | Yes | Yes | Yes | Always store data under `LAST_RESPONSE`. |
| Shared memory keys | Yes | Yes | Yes | Yes | Literal casing enforced via helper modules/classes. |
| Util/API tagging | `@UTILTEST` vs default | `@UTILTEST` vs default | `Category=utiltests` | `@util` / `@api` | Runners rely on these exact tag strings. |
| Screenplay documentation | `docs/SCREENPLAY_GUIDE.md` | `docs/SCREENPLAY_GUIDE.md` | QA strategy Screenplay section | `docs/SCREENPLAY_GUIDE.md` | All point back to this spec. |

Parity status: COMPLETE across all four stacks as of 18/11/25.

---

## 4. Scenario Outline Parity

| Feature Source | Owning Stack | Description |
| --- | --- | --- |
| `TokenDynamicStringParser.feature` | DEMOAPP001 | Canonical dynamic string dataset (length, alpha, numeric, multiline). |
| `TokenDateParser.feature` | DEMOAPP001 | Canonical date dataset (relative offsets, ranges, DST cases). |
| `ParseDateToken_Endpoint.feature` | DEMOAPP001 | Canonical API behaviour coverage for `/parse-date-token`. |
| `TokenDynamicStringParserUtil.feature` | DEMOAPP002 | Mirrors DEMOAPP001 data in SpecFlow format. |
| `tokenparser_api.feature` (TS/Playwright) | DEMOAPP003 | Mirrors the API feature tables with Playwright fixtures. |
| `features/api/*.feature` (Python) | DEMOAPP004 | Pytest-bdd representation of the same outlines. |

Whenever DEMOAPP001 changes a Scenario Outline table:

1. Update DEMOAPP001 features (source of truth).
2. Port the change to DEMOAPP003 (TypeScript Playwright), DEMOAPP002 (SpecFlow), and DEMOAPP004 (Pytest-bdd).
3. Update this document's table if a new feature file is added.
4. Document the change in each stack's `docs/SCREENPLAY_GUIDE.md`.

---

## 5. Observability Hooks

- All Screenplay stacks log ability acquisition/release at DEBUG level (see `TOKENPARSER_LOG_LEVEL` and `TokenParser:Logging:Level`).
- Actor memories expose helper utilities (`UtilActorMemory.ts`, `.cs`, `.py`) so step definitions do not reach into raw dictionaries or contexts.
- The Python stack's `tooling/run_bdd.py` writes Screenplay lifecycle events to `.results/demoapp004_python_playwright_*` logs for parity with the TypeScript CLI wrappers.

---

## 6. Backlog

None. Track new Screenplay findings in `API Testing POC/DEMO_DOCS/Backlog_Parity.md`.

---

## 7. References

- `_API_TESTING_GHERKIN_/DEMOAPP001_TYPESCRIPT_CYPRESS/docs/SCREENPLAY_GUIDE.md`
- `_API_TESTING_GHERKIN_/DEMOAPP002_CSHARP_PLAYWRIGHT/docs/QA_STRATEGY.md`
- `_API_TESTING_GHERKIN_/DEMOAPP003_TYPESCRIPT_PLAYWRIGHT/docs/SCREENPLAY_GUIDE.md`
- `_API_TESTING_GHERKIN_/DEMOAPP004_PYTHON_PLAYWRIGHT/docs/SCREENPLAY_GUIDE.md`
- `API Testing POC/DEMO_DOCS/new_demo_requirements.md`
- `API Testing POC/DEMO_DOCS/batch_runner_design.md`
