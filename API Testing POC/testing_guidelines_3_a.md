# Using the 3A (Arrange, Act, Assert) Pattern in Testing Guidelines

**Version 2 - [12/11/25]**

---

## Arrange: Setup Your Test Environment

**Description:** In this step, all necessary objects, dependencies, and data are initialized and prepared. This involves creating instances of classes, setting initial values, and configuring mocks or stubs if necessary.

**Example:**

```csharp
// Arrange
var calculator = new Calculator();
int a = 5;
int b = 3;
```

---

## Act: Execute the Functionality Being Tested

**Description:** In this step, the method or functionality under test is executed. It should be a single, focused action that triggers the behaviour you want to validate.

**Example:**

```csharp
// Act
var result = calculator.Add(a, b);
```

---

## Assert: Verify the Outcome

**Description:** In this step, the outcomes of the **Act** phase are verified against expected results. Assertions confirm whether the test conditions meet the expected behaviour.

**Example:**

```csharp
// Assert
Assert.Equal(8, result);
```

---

## Alignment with BDD User Stories in Gherkin Syntax

**Description:** The AAA pattern maps directly to the **Given-When-Then** structure in BDD (Behaviour-Driven Development).

- **Given *' Arrange:** Sets up the initial context or preconditions.
- **When *' Act:** Describes the action that triggers behaviour.
- **Then *' Assert:** Defines the expected outcome.

This alignment ensures that tests are clear, concise, and easy to understand.

**Example User Story in Gherkin:**

```gherkin
Feature: Calculator addition
  Scenario: Add two numbers
    Given a calculator
    And the numbers 5 and 3
    When the numbers are added
    Then the result should be 8
```

---

## Practical Example: Integrating AAA with BDD (API Tokens)

Here we integrate the AAA pattern with the Gherkin-based Screenplay frameworks used across DEMOAPP001/003 (TypeScript) and DEMOAPP002 (C# plan).

**Gherkin Feature File:**

```gherkin
Feature: Calculator addition
  Scenario: Add two numbers
    Given a calculator
    And the numbers 5 and 3
    When the numbers are added
    Then the result should be 8
```

**Step Definitions (TypeScript Screenplay Example):**

```typescript
import { Given, When, Then } from "@cucumber/cucumber";
import { SendGetRequest } from "../../../screenplay/tasks/SendGetRequest";
import { ResponseStatus } from "../../../screenplay/questions/ResponseStatus";
import { ResponseBody } from "../../../screenplay/questions/ResponseBody";
import { apiActor } from "../../../screenplay/core/api-world";

Given("the Token Parser API is running", function () {
  // Arrange via Screenplay: actor already knows how to call the API.
});

When("I request the alive endpoint", async function () {
  await apiActor().attemptsTo(SendGetRequest.to("/alive"));
});

Then("the API should respond with ALIVE-AND-KICKING", function () {
  const status = apiActor().answer(ResponseStatus.code());
  const body = apiActor().answer(ResponseBody.json());
  this.expect(status).to.equal(200);
  this.expect(body.Status).to.equal("ALIVE-AND-KICKING");
});
```

---

## Explanation of AAA Alignment with BDD + Screenplay

- **Given / Arrange:** Hooks/worlds create actors and attach abilities (e.g., `CallAnApi`, `UseTokenParsers`).
- **When / Act:** Screenplay tasks (`SendGetRequest`) encapsulate the behaviour under test.
- **Then / Assert:** Screenplay questions (`ResponseStatus`, `ResponseBody`) provide the assertion data.
- **Memory:** Actor memory replaces ad-hoc globals, mirroring AAA’s emphasis on controlled setup/teardown.

---

## Benefits

- **Organized:** Screenplay + AAA keeps Arrange/Act/Assert explicit even when tests are declarative.
- **Readable:** Gherkin scenarios remain business-friendly while the Screenplay layer handles implementation detail.
- **Maintainable:** Tasks/questions can be reused across stacks (tracked in `API Testing POC/DEMO_DOCS/screenplay_parity_typescript.md`).
- **BDD-Friendly:** Aligns with Given/When/Then and the shared contract spec (`API Testing POC/DEMO_DOCS/tokenparser_api_contract.md`).

By following this structured approach, tests remain well-organized, readable, and maintainable, while combining the clarity of BDD with the simplicity of the AAA pattern.

