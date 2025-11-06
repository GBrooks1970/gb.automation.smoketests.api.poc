import { Ability, AbilityType, Question, Task } from "../support/types";

export class Actor {
  private readonly abilities = new Map<AbilityType<Ability>, Ability>();
  private readonly memory = new Map<string, unknown>();

  constructor(public readonly name: string) {}

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

  async attemptsTo(...tasks: Task[]): Promise<void> {
    for (const task of tasks) {
      await task.performAs(this);
    }
  }

  async answer<TAnswer>(question: Question<TAnswer>): Promise<TAnswer> {
    return question.answeredBy(this);
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
}
