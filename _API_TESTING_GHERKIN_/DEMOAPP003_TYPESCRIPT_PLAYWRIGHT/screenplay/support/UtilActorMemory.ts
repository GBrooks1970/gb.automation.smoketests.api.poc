import { CustomWorld } from "../core/custom-world";
import { LAST_GENERATED_STRING, LAST_PARSE_ERROR, LAST_PARSED_RANGE } from "./memory-keys";
import { DateRange } from "../../src/tokenparser/TokenDateParser";

export class UtilActorMemory {
  static rememberDate = (world: CustomWorld, key: string, value: Date) => {
    world.actor.remember(key, value);
  };
  static rememberRange = (world: CustomWorld, value: DateRange) => {
    world.actor.remember(LAST_PARSED_RANGE, value);
  };
  static rememberError = (world: CustomWorld, error: unknown) => {
    world.actor.remember(LAST_PARSE_ERROR, error as Error);
  };
  static clearError = (world: CustomWorld) => world.actor.forget(LAST_PARSE_ERROR);

  static getRememberedDate = (world: CustomWorld, key: string): Date => {
    const value = world.actor.recall<Date>(key);
    if (!value) {
      throw new Error(`Expected a parsed date stored under ${key}`);
    }
    return value;
  };

  static getRange = (world: CustomWorld): DateRange => {
    const range = world.actor.recall<DateRange>(LAST_PARSED_RANGE);
    if (!range) {
      throw new Error("Expected a parsed date range");
    }
    return range;
  };

  static getParseError = (world: CustomWorld): Error | undefined =>
    world.actor.recall<Error>(LAST_PARSE_ERROR);

  static rememberGenerated = (world: CustomWorld, value: string) => {
    world.actor.remember(LAST_GENERATED_STRING, value);
  };

  static getGenerated = (world: CustomWorld): string => {
    const value = world.actor.recall<string>(LAST_GENERATED_STRING);
    if (value === undefined) {
      throw new Error("Expected a generated string to be stored");
    }
    return value;
  };
}
