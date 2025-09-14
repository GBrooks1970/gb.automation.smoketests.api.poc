# Screenplay Pattern in BDD Testing

The **Screenplay Pattern** is a model for organizing automated acceptance tests, especially well-suited for Behavior-Driven Development (BDD). It emphasizes **clear roles**, **task-based design**, and **separation of concerns** to improve test maintainability, readability, and reusability.

---

## Key Concepts

### 1. **Stage**

- The stage represents the test environment where the test unfolds.
- It sets the context for the scenario and prepares the environment for the actors.
- Typically initialized in test setup.

### 2. **Actor**

- An actor is a user or system component performing actions.
- Each actor is given "Abilities" (e.g., to browse the web, call APIs, read data).
- Actors can perform **Tasks** and ask **Questions**.

```csharp
var gary = Actor.named("Gary").whoCan(BrowseTheWeb.with(driver));
```

### 3. **Tasks**

- Tasks are the **actions** that an actor performs.
- They encapsulate a logical unit of work (e.g., login, purchase energy).
- Tasks improve **reusability** and **readability**.

```csharp
gary.attemptsTo(Login.withCredentials("user", "password"));
```

### 4. **Questions**

- Questions are how an actor **checks outcomes**.
- They retrieve information from the system (e.g., "Did the energy types appear?", "What is the order total?").
- Questions return values for assertions or further logic.

```csharp
var isVisible = gary.asksFor(IsVisible.of("BuyButton"));
```

---

## Supporting Elements

### 5. **Abilities**

- Define what an actor can do (e.g., make API calls, interact with a browser).
- Are injected into the actor to enable it to perform certain tasks.

### 6. **Interactions**

- Lower-level actions that tasks can use internally (e.g., clicking buttons, filling forms).
- Not exposed directly in test scenarios, promoting abstraction.

---

## Example in BDD Style (Gherkin)

```gherkin
Scenario: Purchase energy units successfully
  Given Gary can browse the Buy Energy page
  When he logs in with valid credentials
    And purchases 3 units of Gas
  Then the remaining Gas units should decrease accordingly
```

This scenario can be broken into:

- Actor: Gary
- Tasks: Login, PurchaseEnergy
- Questions: RemainingUnits

---

## Benefits

- **Scalable**: Easier to manage growing test suites.
- **Readable**: Reflects real user behavior and domain language.
- **Reusable**: Common tasks/questions can be shared across tests.
- **Maintainable**: Encourages separation of concerns and clean architecture.

The screenplay pattern aligns naturally with BDD, promoting collaboration through domain-specific language and clarity of intent in automated tests.
