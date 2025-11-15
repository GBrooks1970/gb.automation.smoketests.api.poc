# Cypress Screenplay Guide

**Version 1 - [12/11/25]**

## Actors
- Defined in `screenplay/actors/Actor.ts`.
- Cypress actors wrap synchronous command chains; always return Cypress chainables to keep the command queue intact.
- Access actors via helpers exported from `screenplay/core/api-world.ts` and `screenplay/core/util-world.ts` (`apiActor()`, `utilActor()`).

## Abilities
- `CallAnApi` (`screenplay/abilities/CallAnApi.ts`) uses `cy.request` behind the scenes; base URL comes from `Cypress.env("API_BASE_URL")` or `.env` defaults.
- `UseTokenParsers` (`screenplay/abilities/UseTokenParsers.ts`) exposes `TokenDateParser` and `TokenDynamicStringParser` sourced from `src/tokenparser`.
- Add new abilities under `screenplay/abilities` and register them in the relevant world helper so every scenario receives a consistent capability set.

## Tasks
- `SendGetRequest` (`screenplay/tasks/SendGetRequest.ts`) issues GET calls and stores the response under `LAST_RESPONSE`.
- Tasks should be very small; chain multiple tasks via `actor.attemptsTo(...)` rather than writing imperative logic in step definitions.
- Keep side effects inside abilities; tasks simply orchestrate calls.

## Questions
- `ResponseStatus` and `ResponseBody` (`screenplay/questions/*.ts`) read from actor memory and assert via Chai expect.
- Add new questions for domain-specific assertions (e.g., `ParsedDateMatches`) so steps remain declarative.

## Memory & Utilities
- Shared keys live in `screenplay/support/memory-keys.ts`.
- `screenplay/support/UtilActorMemory.ts` centralises helper methods (e.g., `rememberResponse`, `lastResponseJson`).
- Avoid hard-coded strings in step definitions; import keys/utilities instead.

## Worlds & Hooks
- `screenplay/core/api-world.ts` creates `"Cypress API Actor"` per scenario and equips it with `CallAnApi` + `UseTokenParsers`.
- `screenplay/core/util-world.ts` creates `"Cypress Util Actor"` for `@UTILTEST` scenarios to isolate parser-only contexts.
- Step definitions import `apiActor()` / `utilActor()` directly to access the current actor; no extra glue files are required because the worlds self-register through Cypress support hooks.

## Step Definition Style
- Keep steps declarative: `Given('the API is alive', () => apiActor().attemptsTo(SendGetRequest.to('/alive')));`
- Prefer Screenplay Questions for assertions rather than inline `expect`.
- Reuse helper modules from `_API_TESTING_GHERKIN_/DEMOAPP001_TYPESCRIPT_CYPRESS/screenplay/support`.

## Parity Tips
- Mirror any change made here in the Playwright docs/code (and vice versa) to avoid drift.
- Update `API Testing POC/screenplay_parity_typescript.md` whenever you add abilities, tasks, or memory keys.
- Reference `.batch/RUN_DEMOAPP001_TYPESCRIPT_CYPRESS_API_AND_TESTS.BAT` when documenting new execution paths so automation scripts stay in sync.
