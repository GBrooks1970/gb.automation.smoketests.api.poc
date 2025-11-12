# SpecFlow & Screenplay Alignment Guide (DEMOAPP002)

**Version 1 - [12/11/25]**

Although the C# suite does not yet implement the Screenplay pattern, the structure below documents how existing SpecFlow bindings map to Screenplay primitives and what is required to reach parity with the TypeScript stacks.

## Current Binding Structure
- **Feature Files**: `TokenParserTests/Features/*.feature` mirror the scenarios present in the Cypress/Playwright projects.
- **Step Definitions**: Classes under `TokenParserTests/Steps` (e.g., `DateTokenParser_Steps.cs`) hold both orchestration and assertions.
- **Helpers**: `TokenParserTests/Helpers/RequestHelper.cs`, `UrlHelper.cs`, etc., wrap HttpClient requests, response parsing, and assertion helpers.
- **State Management**: Scenario state is stored as private fields inside step classes (`_response`, `_Token`, `_responseContent`), which SpecFlow constructs per-scenario.

## Mapping to Screenplay Concepts
| Screenplay Concept | Current Equivalent | Notes / Gaps |
| --- | --- | --- |
| Actor | SpecFlow step class instance | Introduce an `Actor` class encapsulating helpers instead of storing fields per step file. |
| Ability | `RequestHelper`, `TokenParserClient` | Convert helpers into reusable abilities (e.g., `CallTheApi`) injected via dependency container. |
| Task | Inline step logic (e.g., building URLs, sending requests) | Extract into `Task` classes that receive an Actor and perform operations. |
| Question | Assertions embedded in step definitions | Move assertions into dedicated question classes returning strongly typed results. |
| Memory Keys | Private fields | Replace with a shared `Memory` abstraction so future abilities/tasks stay decoupled. |

## Recommended Migration Path
1. **Introduce Actor & Memory**: Create `Screenplay/Actor.cs` + `Screenplay/MemoryKeys.cs` in the test project; register them via SpecFlow dependency injection.
2. **Wrap Helpers as Abilities**: For example, `CallTokenParserApi` ability exposing `GetAsync`, `PostAsync`, etc., backed by `HttpClient` or Playwright `APIRequestContext`.
3. **Extract Tasks**: Move logic from `When` steps into `SendGetRequest.To(endpoint)` tasks shared across bindings.
4. **Encapsulate Questions**: Assertions like `ValidateStatusCode` or `ParsedTokenShouldEqual` become questions invoked via `actor.Asks(...)`.
5. **Share Parity Docs**: Update `API Testing POC/screenplay_parity_typescript.md` whenever new abilities/questions exist so TypeScript stacks can mirror them.

## Hooks & Dependency Injection
- Configure SpecFlow hooks (e.g., `BeforeScenario`) to construct an `Actor` with the required abilities.
- Dispose resources (HttpClient, Playwright contexts) inside `AfterScenario` to match the lifecycle behaviour already documented for the TypeScript projects.

## References
- Cypress Screenplay guide: `_API_TESTING_GHERKIN_/DEMOAPP001_TYPESCRIPT_CYPRESS/docs/SCREENPLAY_GUIDE.md`.
- Playwright Screenplay guide: `_API_TESTING_GHERKIN_/DEMOAPP003_TYPESCRIPT_PLAYWRIGHT/docs/SCREENPLAY_GUIDE.md`.
- Parity tracker: `API Testing POC/screenplay_parity_typescript.md`.
