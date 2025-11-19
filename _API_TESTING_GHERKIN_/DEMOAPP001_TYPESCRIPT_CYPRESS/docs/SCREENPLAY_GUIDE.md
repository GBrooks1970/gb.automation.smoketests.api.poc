# Screenplay Guide – DEMOAPP001 (Cypress)

**Version 2 – 18/11/25**

## 1. Actor Lifecycle
- Actor factory lives in `screenplay/actors/Actor.ts`.
- `screenplay/core/api-world.ts` registers `"Cypress API Actor"` for API-tagged scenarios; `screenplay/core/util-world.ts` registers `"Cypress Util Actor"` for `@UTILTEST`.
- Worlds run automatically through `cypress/support/e2e.ts`. Step definitions obtain the current actor via `apiActor()` / `utilActor()` helpers; avoid constructing actors manually.

## 2. Abilities
| Ability | Location | Notes |
| --- | --- | --- |
| `CallAnApi` | `screenplay/abilities/CallAnApi.ts` | Wraps `cy.request`, injects `API_BASE_URL` from `.env`/batch scripts. |
| `UseTokenParsers` | `screenplay/abilities/UseTokenParsers.ts` | Surfaces `TokenDateParser` + `TokenDynamicStringParser` from `packages/tokenparser-api-shared`. |
| Future abilities | `screenplay/abilities/*` | Register new abilities inside both world helpers to maintain parity with DEMOAPP003. |

## 3. Tasks & Questions
- **Tasks**: `screenplay/tasks/SendGetRequest.ts`, `ParseTokenLocally.ts`, etc. Tasks remain synchronous (return Cypress chainables) to respect the command queue. Compose tasks with `actor.attemptsTo(...)`.
- **Questions**: `screenplay/questions/ResponseStatus.ts`, `ResponseBody.ts`, `ParsedToken.ts`. Questions read from memory keys and assert via Chai.
- **Guidelines**:
  - Keep step definitions declarative: they should simply call tasks/questions.
  - Any HTTP interaction must flow through `CallAnApi`; local parser assertions must use `UseTokenParsers`.

## 4. Memory Keys & Utilities
- Constants defined in `screenplay/support/memory-keys.ts` (e.g., `LAST_RESPONSE`, `LAST_PARSED_DATE`, `LAST_PARSED_DYNAMIC`).
- Helper functions inside `screenplay/support/UtilActorMemory.ts` provide strongly typed getters/setters for Cypress-friendly use.
- Never use string literals in steps; import memory helpers to avoid parity drift with DEMOAPP003/002/004.

## 5. Hooks & Fixtures
- Badeball Cucumber hooks declared in `screenplay/core/*.ts` handle:
  - Actor creation per scenario.
  - Ability acquisition/release.
  - Memory reset via `Before`/`After` hooks.
- No additional `beforeEach` logic is required in Cypress because the worlds self-register.

## 6. Step Definition Guidance
```
Given('the API is alive', () => {
  apiActor().attemptsTo(SendGetRequest.to('/alive'));
});

Then('the response status is {int}', (code) => {
  apiActor().shouldSee(ExpectResponseStatus.toEqual(code));
});
```
- Prefer reusing shared tasks/questions rather than inlining assertions.
- Util scenarios must carry `@UTILTEST`; API scenarios remain untagged or `@api`.

## 7. Parity Checklist
1. Whenever you add a task/ability/question, mirror it in DEMOAPP003 (TypeScript Playwright) and update the parity doc `API Testing POC/DEMO_DOCS/screenplay_parity_demoapps.md`.
2. Update DEMOAPP002 (SpecFlow) and DEMOAPP004 (pytest-bdd) docs when new memory keys or scenario outlines appear.
3. Confirm `.batch/RUN_ALL_API_AND_TESTS.BAT` still reports the correct test counts after modifications.

## 8. Troubleshooting
- If actors appear undefined, ensure the relevant world helper is imported inside `cypress/support/e2e.ts`.
- When adding asynchronous helpers, wrap them inside Cypress commands to avoid breaking the command queue.
- Enable verbose logging by setting `TOKENPARSER_LOG_LEVEL=debug` and use `.results/demoapp001_typescript_cypress_<UTC>.txt` for diagnostics.
