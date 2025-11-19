import type { Ability } from "../core/types";
import {
  TokenDateParser,
  TokenDynamicStringParser,
  DateRange,
} from "tokenparser-api-shared";

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

  parseTokenizedStringLines(token: string): string[] {
    const generated = this.parseDynamicString(token);
    return generated.split(/\r?\n/).filter((line) => line.length > 0);
  }
}
