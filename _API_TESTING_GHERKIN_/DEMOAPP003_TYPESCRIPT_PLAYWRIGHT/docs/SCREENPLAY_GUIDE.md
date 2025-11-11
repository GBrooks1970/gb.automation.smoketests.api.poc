# Screenplay Pattern Reference

**Version 2 - [12/11/25]**

## Actors
- `Actor` encapsulates abilities and scenario memory. Use `actor.whoCan(...)` to compose behaviours (API calls, parser utilities).
- `remember/recall` functions store transient data (e.g., last API response). Prefer descriptive keys such as `last-response` or `parsed-date`.

## Abilities
- `CallAnApi` (`screenplay/abilities/CallAnApi.ts`) – wraps Playwright `APIRequestContext`, centralises base URL management, and disposes contexts in `After` hooks (see `features/step_definitions/world.ts`).
- `UseTokenParsers` (`screenplay/abilities/UseTokenParsers.ts`) – exposes `TokenDateParser` and `TokenDynamicStringParser` with feature-flag friendly extension points.

### Adding a New Ability
1. Create class under `screenplay/abilities` implementing `Ability` interface.
2. Provide factory/constructor to configure dependencies (e.g., credentials, clients).
3. Register ability in `CustomWorld.enableApiAbility()` or in scenario-specific hooks.

## Tasks
- `SendGetRequest` (`screenplay/tasks/SendGetRequest.ts`) issues GET requests and stores the response under `LAST_RESPONSE`.
- Parser helpers for util flows currently live beside the relevant step definitions; prefer adding thin Screenplay tasks if reuse expands.
- Tasks should orchestrate behaviour only—assertions belong in Questions or dedicated step helpers.

### Task Guidelines
- Implement `performAs(actor: Actor)` and use `actor.abilityTo(...)` to access abilities.
- Keep tasks small; chain multiple tasks inside `actor.attemptsTo()` to narrate behaviour.

## Questions
- `ResponseStatus`, `ResponseBody`, and JSON helpers (`screenplay/questions/*.ts`) expose assertions while preserving Screenplay vocabulary.
- When adding new questions (e.g., `ParsedTokenDate`), read shared keys from `screenplay/support/memory-keys.ts` to remain parity-aligned with Cypress.

## World & Hooks
- `screenplay/core/custom-world.ts` defines the `CustomWorld` consumed by Cucumber. It instantiates an actor per scenario and stores it on `this.actor`.
- `features/step_definitions/world.ts` wires `Before`/`After` hooks: attaches `CallAnApi`, injects feature tags (e.g., `@utiltest`), and ensures contexts are disposed.
- Shared utilities such as `screenplay/support/UtilActorMemory.ts` centralise `remember/recall` helpers; reference them rather than duplicating string literals.

## Step Definition Style Guide
- Keep step definitions declarative. Delegate to Screenplay tasks/questions instead of imperative code.
- Always await asynchronous operations; use TypeScript generics on `Given/When/Then` to retain `CustomWorld` typing.
- Use helper utilities for repetitive assertions (e.g., `formatDateUtc`).

## Extending the Framework
1. **New Feature Area** - create feature file mirroring business language, add step definitions calling existing tasks/questions.
2. **Complex API Workflow** - add new task (maybe combine multiple API calls), capture intermediate data via `remember`/`recall`.
3. **UI Coverage** - create Playwright page objects, wrap them in abilities (`UseTheWeb`) and questions (e.g., `DisplayedMessage`).
4. **Shared State** - prefer explicit Screenplay `remember` keys; avoid global variables to maintain scenario isolation.

## Troubleshooting Tips
- If `CallAnApi` fails to resolve base URL, confirm `.env` (or `env_utils.bat`) exposes `API_BASE_URL` before scenarios run.
- For flaky time-based assertions, sync the host clock or inject reference dates via `UseTokenParsers`.
- When debugging, prefer Screenplay-friendly logging: `actor.remember("debug:last-response", response)` then surface via `UtilActorMemory.dumpLatestResponse()`.

