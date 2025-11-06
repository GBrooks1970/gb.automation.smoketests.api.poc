# Screenplay Pattern Reference

## Actors
- `Actor` encapsulates abilities and scenario memory. Use `actor.whoCan(...)` to compose behaviours (API calls, parser utilities).
- `remember/recall` functions store transient data (e.g., last API response). Prefer descriptive keys such as `last-response` or `parsed-date`.

## Abilities
- `CallAnApi` - wraps Playwright `APIRequestContext`, centralises base URL management, and disposes context post-scenario.
- `UseTokenParsers` - exposes `TokenDateParser` and `TokenDynamicStringParser` capabilities for util tests.

### Adding a New Ability
1. Create class under `screenplay/abilities` implementing `Ability` interface.
2. Provide factory/constructor to configure dependencies (e.g., credentials, clients).
3. Register ability in `CustomWorld.enableApiAbility()` or in scenario-specific hooks.

## Tasks
- `SendGetRequest` - issues GET requests and stores the response under `last-response`.
- Extend tasks to cover POST/PUT flows. Tasks should never assert; they orchestrate abilities.

### Task Guidelines
- Implement `performAs(actor: Actor)` and use `actor.abilityTo(...)` to access abilities.
- Keep tasks small; chain multiple tasks inside `actor.attemptsTo()` to narrate behaviour.

## Questions
- `ResponseStatus` and `ResponseJson` expose response assertions while preserving Screenplay vocabulary.
- New questions should encapsulate domain logic (e.g., `ParsedTokenDate`). Use inside step definitions via `await actor.answer(question)`.

## World & Hooks
- `CustomWorld` (in `screenplay/support`) configures actors before scenarios. Hooks attach API ability and clean up contexts.
- Update `features/step_definitions/world.ts` if additional worlds/hook modules are introduced.

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
- If `CallAnApi` fails to resolve base URL, verify `API_BASE_URL` env var or server startup script.
- For flaky time-based assertions, confirm system clock sync; consider injecting fixed reference date for deterministic tests.
- When debugging, log via `console.log` within step definitions or extend Actor memory to capture extra telemetry.

