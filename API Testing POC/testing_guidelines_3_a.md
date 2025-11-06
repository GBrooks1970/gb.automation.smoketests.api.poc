# Using the 3A (Arrange, Act, Assert) Pattern in Testing Guidelines

**Version 1 - [17/07/24]**

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

## Practical Example: Integrating AAA with BDD

Here we integrate the AAA pattern with a Gherkin-based BDD framework (e.g., Cucumber.js in TypeScript).

**Gherkin Feature File:**

```gherkin
Feature: Calculator addition
  Scenario: Add two numbers
    Given a calculator
    And the numbers 5 and 3
    When the numbers are added
    Then the result should be 8
```

**Step Definitions (TypeScript Example):**

```typescript
import { Given, When, Then } from "@cucumber/cucumber";
import assert from "assert";

let calculator: Calculator;
let result: number;

Given('a calculator', function () {
  calculator = new Calculator();
});

Given('the numbers {int} and {int}', function (a: number, b: number) {
  this.a = a;
  this.b = b;
});

When('the numbers are added', function () {
  result = calculator.add(this.a, this.b);
});

Then('the result should be {int}', function (expected: number) {
  assert.strictEqual(result, expected);
});
```

---

## Explanation of AAA Alignment with BDD

- **Given *' Arrange:** Prepares the initial context/environment.
- **When *' Act:** Executes the functionality under test.
- **Then *' Assert:** Compares the outcome to the expected result.

---

## Benefits

- **Organized:** Provides a clear structure.
- **Readable:** Easy for both technical and non-technical stakeholders.
- **Maintainable:** Keeps tests simple and effective.
- **BDD-Friendly:** Directly aligns with Gherkin for seamless integration.

By following this structured approach, tests remain well-organized, readable, and maintainable, while combining the clarity of BDD with the simplicity of the AAA pattern.

