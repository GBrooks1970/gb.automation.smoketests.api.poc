import type { Ability } from "../core/types";
import { TokenDateParser, DateRange } from "../../tokenparser/TokenDateParser";
import { TokenDynamicStringParser } from "../../tokenparser/TokenDynamicStringParser";

export class UseTokenParsers implements Ability {
  get description(): string {
    return "Use token parsing utilities";
  }

  parseDateToken(token: string): Date {
    return TokenDateParser.parseDateStringToken(token);
  }

  parseDateStringToken(token: string): Date {
    return TokenDateParser.parseDateStringToken(token);
  }

  parseDateRangeToken(token: string): DateRange {
    return TokenDateParser.parseDateStringToken_DateRange(token);
  }

  parseDynamicString(token: string): string {
    return TokenDynamicStringParser.parseAndGenerate(token);
  }
}
