import {
  LAST_PARSED_DATE,
  SECONDARY_PARSED_DATE,
  LAST_PARSED_RANGE,
  LAST_PARSE_ERROR,
  LAST_GENERATED_STRING,
} from "./memory-keys";
import { DateRange } from "tokenparser-api-shared";
import { utilActor } from "../core/util-world";

export class UtilActorMemory {
  static rememberDate = (key: string, value: Date) => {
    utilActor().remember(key, value);
  };

  static rememberRange = (value: DateRange) => {
    utilActor().remember(LAST_PARSED_RANGE, value);
  };
  static rememberError = (error: unknown) => {
    utilActor().remember(LAST_PARSE_ERROR, error as Error);
  };
  static clearError = () => utilActor().forget(LAST_PARSE_ERROR);

  static getRememberedDate = (key: string): Date => {
    const value = utilActor().recall<Date>(key);
    if (!value) {
      throw new Error(`Expected a parsed date stored under ${key}`);
    }
    return value;
  };

  static getRange = (): DateRange => {
    const range = utilActor().recall<DateRange>(LAST_PARSED_RANGE);
    expect(range, "No parsed date range stored").to.exist;
    return range!;
  };

  static getParseError = (): Error | undefined => utilActor().recall<Error>(LAST_PARSE_ERROR);

  static rememberGenerated = (value: string) => utilActor().remember(LAST_GENERATED_STRING, value);

  static getGenerated = (): string => utilActor().recall<string>(LAST_GENERATED_STRING) ?? "";
}
