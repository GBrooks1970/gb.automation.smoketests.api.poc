# Screenplay Guide – DEMOAPP003 (Playwright)

**Version 2 – 18/11/25**

## 1. Actor Lifecycle
- `screenplay/core/custom-world.ts` wires Cucumber worlds to Playwright's test fixtures.
- Each scenario receives `Actor.named("Playwright API Tester")` plus abilities defined below.
- `Before`/`After` hooks tear down the Playwright `APIRequestContext` and clear memory to avoid cross-test bleed.

## 2. Abilities
| Ability | Location | Description |
| --- | --- | --- |
| `CallAnApi` | `screenplay/abilities/CallAnApi.ts` | Wraps Playwright `APIRequestContext` for HTTP verbs. |
| `UseTokenParsers` | `screenplay/abilities/UseTokenParsers.ts` | Imports parser helpers from `src/tokenparser`. |
| Additional Abilities | `screenplay/abilities/*` | New abilities must be registered in `custom-world.ts` and mirrored in DEMOAPP001. |

## 3. Tasks & Questions
- Tasks reside in `screenplay/tasks/` (e.g., `SendGetRequest.ts`, `ParseTokenLocally.ts`). They are async functions returning `Promise<void>`.
- Questions live in `screenplay/questions/` (e.g., `ResponseStatus.ts`, `ResponseBody.ts`) and should be used in step definitions instead of inline assertions.
- Compose steps as:
```ts
Given('the API is alive', async function () {
  await this.actor.attemptsTo(SendGetRequest.to('/alive'));
});
```

## 4. Memory & Utilities
- Memory keys: `screenplay/support/memory-keys.ts`.
- Helpers: `screenplay/support/UtilActorMemory.ts` exposes typed getters/setters.
- Shared between DEMOAPP001 and DEMOAPP003; changes must be coordinated.

## 5. Hooks & Fixtures
- `screenplay/core/custom-world.ts`:
  - Creates the actor.
  - Registers abilities (`CallAnApi`, `UseTokenParsers`).
  - Provides helper methods such as `actor()` and `memory` for step definitions.
- `features/support/hooks.ts` (if present) should be limited to logging; most logic belongs in Screenplay worlds.

## 6. Parity Requirements
1. Tags – Util scenarios must remain tagged `@UTILTEST`; API scenarios stay default or `@api`.
2. Memory keys, tasks, and abilities must mirror DEMOAPP001 to keep `API Testing POC/DEMO_DOCS/screenplay_parity_demoapps.md` accurate.
3. When adding new steps or helpers, update Docs + parity tables and notify DEMOAPP002/004 owners.

## 7. Troubleshooting
- Missing actor: ensure step definitions extend `CustomWorld` typings (see `features/support/world.ts`).
- API base URL wrong: confirm `.env` or batch script sets `API_BASE_URL` to `http://localhost:3001`.
- Failing util tests due to timezone: use `DateFormatting.CanonicalFormat` from `src/tokenparser`.
