import type { Ability } from "../support/types";
import { TokenDateParser, DateRange } from "../../src/tokenparser/TokenDateParser";
import { TokenDynamicStringParser } from "../../src/tokenparser/TokenDynamicStringParser";

export class UseTokenParsers implements Ability {
  get description(): string {
    return "Use token parsing utilities";
  }

  parseDateToken(token: string): Date {
    return TokenDateParser.parseDateStringToken_Full(token);
  }

  parseDateStringToken(token: string): Date {
    return TokenDateParser.parseDateStringToken(token);
  }

  parseDateRangeToken(token: string): DateRange {
    return TokenDateParser.parseDateStringToken_DateRange(token);
  }

  parseTokenizedString(token: string): string {
    return TokenDynamicStringParser.parseAndGenerate(token);
  }

  parseTokenizedStringLines(token: string): string[] {
    const generated = this.parseTokenizedString(token);
    return generated.split(/\r?\n/).filter((line) => line.length > 0);
  }
}
