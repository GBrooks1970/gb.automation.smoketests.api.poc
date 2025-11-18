# Screenplay Guide – DEMOAPP002 (SpecFlow + Playwright)

**Version 2 – 18/11/25**

## 1. Actor & Hook Model
- Actors are created inside `TokenParserTests/Screenplay/Support/ScreenplayHooks.cs`.
- `[BeforeScenario]` inspects tags (`utiltests`, `apitests`) and provisions the correct abilities.
- `[AfterScenario]` disposes Playwright request contexts and clears memory keys.
- Access the current actor via helper extensions stored in `Screenplay/Support/ScenarioContextExtensions.cs`.

## 2. Abilities
| Ability | Location | Description |
| --- | --- | --- |
| `CallAnApi` | `Screenplay/Abilities/CallAnApi.cs` | Wraps Playwright `.APIRequestContext` for HTTP calls. |
| `UseTokenParsers` | `Screenplay/Abilities/UseTokenParsers.cs` | Exposes shared parser classes (`TokenDynamicStringParser`, `TokenDateParser`). |
| Future abilities | `Screenplay/Abilities/*` | Register in ScreenplayHooks and update parity doc. |

## 3. Tasks, Questions, Memory
- Tasks live under `Screenplay/Tasks/` (e.g., `SendGetRequest.cs`, `ParseTokenLocally.cs`).
- Questions live under `Screenplay/Questions/` (e.g., `ResponseStatus.cs`, `ParsedToken.cs`).
- Memory keys defined in `Screenplay/Support/MemoryKeys.cs` (`LAST_RESPONSE`, `LAST_PARSED_DATE`, etc.).
- Helpers in `Screenplay/Support/UtilActorMemory.cs` provide typed getters/setters.

## 4. Request Helpers
- `Helpers/RequestHelper.cs` (HttpClient) and `Helpers/RequestHelper_PW.cs` (Playwright) centralise HTTP logic. They now enforce nullable safety to avoid warnings.
- Use the helpers inside tasks only; step definitions should never instantiate HTTP clients directly.

## 5. Step Definition Guidance
- Step bindings sit under `TokenParserTests/StepDefinitions/**`. Each binding should:
  1. Resolve the actor from `ScenarioContext`.
  2. Invoke a task or question from the Screenplay folders.
  3. Avoid ad-hoc assertions; rely on Questions for consistency with other stacks.
- Example:
```csharp
[Given(@"the API is alive")]
public async Task GivenTheApiIsAlive()
{
    await _actor.AttemptsTo(SendGetRequest.To("/alive"));
}
```

## 6. Parity Checklist
1. Mirror abilities/tasks/memory keys documented here with DEMOAPP001/003/004 and update `API Testing POC/DEMO_DOCS/screenplay_parity_demoapps.md`.
2. Re-run `.batch/RUN_ALL_API_AND_TESTS.BAT` after adding new features to ensure metrics capture the updated counts.
3. When feature tables change in DEMOAPP001, regenerate SpecFlow bindings (build task) and review `*.feature.cs` files for drift.

## 7. Troubleshooting
- If actors are null, confirm that `ScreenplayHooks` is decorated with `[Binding]` and registered in `specflow.json`.
- To inspect Playwright traffic, enable `APIRequestContextOptions.Trace` inside `RequestHelper_PW`.
- Logging level mismatches can be fixed by setting `TokenParser:Logging:Level` in `appsettings.Development.json` or `.env`.
