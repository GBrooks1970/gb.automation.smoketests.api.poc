# Screenplay Parity – TypeScript Stacks

**Version 1 - [11/11/25]**

This note captures the current Screenplay implementation in the two TypeScript stacks and highlights how actors, abilities, tasks, questions, and worlds line up. Use it as the single reference when extending the pattern across new features.

---

## 1. Stack Overview

| Capability | DEMOAPP001 (Cypress) | DEMOAPP003 (Playwright) |
| --- | --- | --- |
| Runtime | Cypress + `@badeball/cypress-cucumber-preprocessor` | Playwright + `@cucumber/cucumber` |
| Actor lifecycle | Hook-scoped via `screenplay/core/api-world.ts` & `screenplay/core/util-world.ts` | Custom world (`screenplay/core/custom-world.ts`) instantiates an actor per scenario |
| Abilities | `CallAnApi`, `UseTokenParsers` | `CallAnApi`, `UseTokenParsers` |
| Tasks | `SendGetRequest`, util parsing helpers | `SendGetRequest`, util parsing helpers |
| Questions | `ResponseStatus`, `ResponseBody` | `ResponseStatus`, `ResponseBody`, JSON helpers |
| Memory keys | `screenplay/support/memory-keys.ts` (Cypress) | `screenplay/support/memory-keys.ts` (Playwright) |

---

## 2. Actors, Types & Worlds

### Cypress (`_API_TESTING_GHERKIN_/DEMOAPP001_TYPESCRIPT_CYPRESS`)
- **Actor definition:** `screenplay/actors/Actor.ts` stores abilities/memory using synchronous Cypress chains.  
- **Core types:** `screenplay/core/types.ts` codifies `Ability`, `Task`, `Question`, and `AbilityType`.  
- **Worlds:**  
  - `screenplay/core/api-world.ts` creates a single actor (`"Cypress API Actor"`) before every scenario.  
  - `screenplay/core/util-world.ts` creates `"Cypress Util Actor"` only for `@UTILTEST` scenarios, keeping util memory isolated.  
- **Usage:** API steps import `apiActor()`; util steps import `utilActor()`. Each actor is recreated per scenario to avoid leakage.

### Playwright (`_API_TESTING_GHERKIN_/DEMOAPP003_TYPESCRIPT_PLAYWRIGHT`)
- **Actor definition:** `screenplay/actors/Actor.ts` mirrors the Cypress version but tasks and questions are `async`.  
- **Core types:** `screenplay/core/types.ts` defines the async variants.  
- **World setup:** `screenplay/core/custom-world.ts` provides a `CustomWorld` for each scenario, instantiating an actor with `UseTokenParsers` by default and adding `CallAnApi` during `Before`.  
- **Usage:** Step definitions access the actor via `this.actor` inside Cucumber hooks.

---

## 3. Abilities & Tasks

| Ability/Task | Cypress Location | Playwright Location | Notes |
| --- | --- | --- | --- |
| `CallAnApi` | `screenplay/abilities/CallAnApi.ts` (wraps `cy.request`) | `screenplay/abilities/CallAnApi.ts` (wraps Playwright `APIRequestContext`) | Both provide `get`/`post`, but Playwright includes `dispose()` to close contexts. |
| `UseTokenParsers` | `screenplay/abilities/UseTokenParsers.ts` (uses `src/tokenparser` directly) | `screenplay/abilities/UseTokenParsers.ts` | Identical parser surface after parity work (includes `parseTokenizedStringLines`). |
| `SendGetRequest` | `screenplay/tasks/SendGetRequest.ts` (Cypress chain) | `screenplay/tasks/SendGetRequest.ts` (async/await) | Step definitions call `actor.attemptsTo(SendGetRequest.to("/alive"))`. |
| Questions | `screenplay/questions/ResponseStatus.ts`, `ResponseBody.ts` | Same modules (plus Playwright’s JSON question) | Both fetch data from actor memory (`LAST_RESPONSE`). |

---

## 4. Memory & Keys

- Shared constants live in `screenplay/support/memory-keys.ts` in each stack.  
- Cypress writes `LAST_RESPONSE` via `SendGetRequest` and relies on `UtilActorMemory` helpers (`cypress/support/step_definitions/step_utils/UtilActorMemory.ts`).  
- Playwright memory helpers sit under `features/step_definitions/step_utils/UtilActorMemory.ts` and reference the same keys to avoid name drift.

---

## 5. Actor Usage by Test Type

| Test Type | Cypress Actor | Playwright Actor |
| --- | --- | --- |
| API endpoints (`/alive`, `/parse-*`) | `"Cypress API Actor"` | `"Playwright API Tester"` |
| Util parser scenarios | `"Cypress Util Actor"` scoped via `@UTILTEST` tag | Same actor per scenario; util steps share `UseTokenParsers` ability |
| Number of actors concurrently | Up to 2 (API + Util) if util tag overlaps (rare) | One per scenario (world-based) |

---

## 6. Gaps & Next Actions

1. **Doc sync:** Keep this parity note and the project readmes aligned whenever new abilities/memory keys land.

---

## References

- Cypress Screenplay root: `_API_TESTING_GHERKIN_/DEMOAPP001_TYPESCRIPT_CYPRESS/screenplay/**`  
- Playwright Screenplay root: `_API_TESTING_GHERKIN_/DEMOAPP003_TYPESCRIPT_PLAYWRIGHT/screenplay/**`  
- Util helpers: `cypress/support/step_definitions/step_utils/UtilActorMemory.ts`, `features/step_definitions/step_utils/UtilActorMemory.ts`
