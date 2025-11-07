export interface Ability {
  readonly description?: string;
}

export interface Task {
  performAs(actor: Actor): Cypress.Chainable<unknown>;
}

export interface Question<TAnswer> {
  answeredBy(actor: Actor): TAnswer;
}

export type AbilityType<TAbility extends Ability> = abstract new (...args: any[]) => TAbility;

// eslint-disable-next-line @typescript-eslint/no-use-before-define
export interface Actor {
  abilityTo<TAbility extends Ability>(abilityType: AbilityType<TAbility>): TAbility;
  remember<TValue>(key: string, value: TValue): void;
  recall<TValue>(key: string): TValue | undefined;
}
