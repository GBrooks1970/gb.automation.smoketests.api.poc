# Screenplay Parity – TypeScript Stacks

**Version 2 - [12/11/25]**

This note captures the current Screenplay implementation in the two TypeScript stacks and highlights how actors, abilities, tasks, questions, memory, and tooling line up. Architecture/QA details live in each project’s `docs/` folder; this file remains the shared parity dashboard.

---

## 1. Stack Overview

| Capability | DEMOAPP001 (Cypress) | DEMOAPP003 (Playwright) |
| --- | --- | --- |
| Runtime | Cypress + `@badeball/cypress-cucumber-preprocessor` | Playwright + `@cucumber/cucumber` |
| Actor lifecycle | `screenplay/core/api-world.ts` & `util-world.ts` recreate actors per scenario | `screenplay/core/custom-world.ts` instantiates an actor per scenario |
| Abilities | `CallAnApi`, `UseTokenParsers` | `CallAnApi`, `UseTokenParsers` |
| Tasks | `SendGetRequest` (sync Cypress chainers) + lightweight parser helpers near util steps | `SendGetRequest` (async/await) + parser helpers |
| Questions | `ResponseStatus`, `ResponseBody`, util helpers (`UtilActorMemory`) | Same modules plus JSON helpers |
| Memory keys | `screenplay/support/memory-keys.ts` | `screenplay/support/memory-keys.ts` |
| Tooling | `npm run lint`, `npm run format`, `npm run ts:check`, `npm run test:bdd` / `verify` | Same scripts + optional `npm run pw:test` |
| Docs | `_API_TESTING_GHERKIN_/DEMOAPP001_TYPESCRIPT_CYPRESS/docs` | `_API_TESTING_GHERKIN_/DEMOAPP003_TYPESCRIPT_PLAYWRIGHT/docs` |

---

## 2. Actors, Types & Worlds

### Cypress (`_API_TESTING_GHERKIN_/DEMOAPP001_TYPESCRIPT_CYPRESS`)
- **Actor**: `screenplay/actors/Actor.ts` stores abilities/memory using synchronous Cypress chains.
- **Types**: `screenplay/core/types.ts` codifies `Ability`, `Task`, `Question`, `AbilityType`.
- **Worlds**:
  - `screenplay/core/api-world.ts` provisions `"Cypress API Actor"` for REST scenarios.
  - `screenplay/core/util-world.ts` provisions `"Cypress Util Actor"` for `@UTILTEST` tagged scenarios.
- **Usage**: Step defs import `apiActor()` / `utilActor()`; each scenario gets a fresh actor.

### Playwright (`_API_TESTING_GHERKIN_/DEMOAPP003_TYPESCRIPT_PLAYWRIGHT`)
- **Actor**: `screenplay/actors/Actor.ts` mirrors the Cypress version but everything is `async`.
- **World**: `screenplay/support/custom-world.ts` exposes `CustomWorld`; hooks in `features/step_definitions/world.ts` attach abilities.
- **Usage**: Step defs access `this.actor` from the Cucumber world.

---

## 3. Abilities & Tasks

| Ability/Task | Cypress Location | Playwright Location | Notes |
| --- | --- | --- | --- |
| `CallAnApi` | `screenplay/abilities/CallAnApi.ts` (wraps `cy.request`) | `screenplay/abilities/CallAnApi.ts` (wraps Playwright `APIRequestContext`) | Same interface; Playwright version disposes contexts in `After` hooks. |
| `UseTokenParsers` | `screenplay/abilities/UseTokenParsers.ts` | `screenplay/abilities/UseTokenParsers.ts` | Shared parser surface (`TokenDateParser`, `TokenDynamicStringParser`). |
| `SendGetRequest` | `screenplay/tasks/SendGetRequest.ts` (Cypress chain) | `screenplay/tasks/SendGetRequest.ts` (async/await) | Primary task for REST scenarios in both stacks. |
| Parser helpers | Util step folders | Util step folders | Promote to shared tasks when reuse grows. |
| Questions | `screenplay/questions/ResponseStatus.ts`, `ResponseBody.ts` | Same modules + JSON helper | Both retrieve `LAST_RESPONSE` from actor memory. |

---

## 4. Memory & Utilities

- Shared constants live in `screenplay/support/memory-keys.ts`.
- `UtilActorMemory.ts` (in each project) centralises helper methods like `lastResponseJson`.
- Step defs should never hard-code memory keys; always import from these modules.

---

## 5. Actor Usage by Test Type

| Test Type | Cypress Actor | Playwright Actor | Notes |
| --- | --- | --- | --- |
| API endpoints (`/alive`, `/parse-*`) | `"Cypress API Actor"` | `"Playwright API Tester"` | Identical abilities. |
| Util parser scenarios | `"Cypress Util Actor"` | Same actor per scenario | Util flows share `UseTokenParsers`. |
| Parallelism | Up to 2 actors (API + util) if tags overlap | One actor per scenario | Hooks isolate abilities/memory. |

---

## 6. Gaps & Next Actions

1. **Doc sync** – Update this parity note and both project docs whenever Screenplay helpers change.
2. **SpecFlow adoption** – ✅ DEMOAPP002 now runs entirely on Screenplay (see `_API_TESTING_GHERKIN_/DEMOAPP002_CSHARP_PLAYWRIGHT/docs`); keep the three stacks in lockstep.
3. **Shared tasks** – Extract parser-specific tasks into `screenplay/tasks` once reuse scales beyond a single feature folder.

---

## References

- Cypress Screenplay root: `_API_TESTING_GHERKIN_/DEMOAPP001_TYPESCRIPT_CYPRESS/screenplay/**`
- Playwright Screenplay root: `_API_TESTING_GHERKIN_/DEMOAPP003_TYPESCRIPT_PLAYWRIGHT/screenplay/**`
- Util helpers: `cypress/support/step_definitions/step_utils/UtilActorMemory.ts`, `features/step_definitions/step_utils/UtilActorMemory.ts`
