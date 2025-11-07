import type { Ability, AbilityType, Question, Task } from "../core/types";

export class Actor {
  private readonly abilities = new Map<AbilityType<Ability>, Ability>();
  private readonly memory = new Map<string, unknown>();

  constructor(public readonly name: string) {}

  static named(name: string): Actor {
    return new Actor(name);
  }

  whoCan(...abilities: Ability[]): this {
    abilities.forEach((ability) => {
      this.abilities.set(ability.constructor as AbilityType<Ability>, ability);
    });
    return this;
  }

  abilityTo<TAbility extends Ability>(abilityType: AbilityType<TAbility>): TAbility {
    const ability = this.abilities.get(abilityType);
    if (!ability) {
      throw new Error(`${this.name} does not have the ability ${abilityType.name}`);
    }
    return ability as TAbility;
  }

  attemptsTo(...tasks: Task[]): Cypress.Chainable<unknown> {
    let chain: Cypress.Chainable<unknown> = cy.wrap(null, { log: false }) as Cypress.Chainable<unknown>;
    tasks.forEach((task) => {
      chain = chain.then(() => task.performAs(this));
    });
    return chain;
  }

  remember<TValue>(key: string, value: TValue): void {
    this.memory.set(key, value);
  }

  recall<TValue>(key: string): TValue | undefined {
    return this.memory.get(key) as TValue | undefined;
  }

  forget(key: string): void {
    this.memory.delete(key);
  }

  answer<TAnswer>(question: Question<TAnswer>): TAnswer {
    return question.answeredBy(this);
  }
}
