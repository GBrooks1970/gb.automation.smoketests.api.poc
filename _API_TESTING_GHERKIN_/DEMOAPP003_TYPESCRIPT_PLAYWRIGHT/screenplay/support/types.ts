import type { Actor } from "../actors/Actor";

export interface Ability {
  readonly description: string;
}

export interface Task {
  performAs(actor: Actor): Promise<void> | void;
}

export interface Question<TAnswer> {
  answeredBy(actor: Actor): Promise<TAnswer> | TAnswer;
}

export type AbilityType<TAbility extends Ability> = new (...args: never[]) => TAbility;
