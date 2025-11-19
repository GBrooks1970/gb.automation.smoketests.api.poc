import CommonUtils from "../services/common-utils";
import { SymbolsDate } from "../services/symbol-consts";
import { createLogger } from "../services/logger";

export type DateUnitSection = "YEAR" | "MONTH" | "DAY";
export type DateStartSection = "TODAY" | "TOMORROW" | "YESTERDAY";
export type DateRangeMonthStartEnd = "START" | "END";
export enum MonthEnum {
  JANUARY = 0,
  FEBRUARY = 1,
  MARCH = 2,
  APRIL = 3,
  MAY = 4,
  JUNE = 5,
  JULY = 6,
  AUGUST = 7,
  SEPTEMBER = 8,
  OCTOBER = 9,
  NOVEMBER = 10,
  DECEMBER = 11,
}

const logger = createLogger("TokenDateParser");

export interface DateRange {
  Start: Date;
  End: Date;
}

export type DateTokenFormats = {
  Full: "[STARTDATE][+ve/-ve][DATEPART][+ve/-ve][DATEPART][+ve/-ve][DATEPART]";
  MonthStartEnd: "[MONTHENDSTART][MONTH][YEAR]";
  DateRange: "[MONTHENDSTART][MONTH][YEAR]<->[MONTHENDSTART][MONTH][YEAR]";
};

export class TokenDateParser {
  static readonly errorInvalidStringTokenFormat = "Invalid string token format";

  static isValidDateToken(token: string): boolean {
    try {
      logger.debug(`VALIDATING ${token}`);
      if (SymbolsDate.BracketedTokenRegex.test(token)) {
        logger.debug(`FOUND-TOKEN BRACKETS -> token: ${CommonUtils.toJSONString(token)}`);
        const innerToken = token.slice(1, -1); // Remove the surrounding brackets
        return this.isValidInnerToken(innerToken);
      }
    } catch (error) {
      logger.debug(
        `${this.isValidDateToken.name}: ERROR VALIDATING TOKEN DATE ${token} : ${error}`,
      );
      return false;
    }

    logger.debug(`1# INVALID TOKEN ${token}`);
    return false;
  }

  static isValidInnerToken(innerToken: string): boolean {
    logger.debug(`VALIDATING InnerToken ${innerToken}`);

    const regexes = Object.values(SymbolsDate.TokenDate);

    if (!SymbolsDate.TokenDate.FullRegex.test(innerToken)) {
      logger.debug(`2# INVALID TOKEN FullRegex ${innerToken}`);
    }

    if (!SymbolsDate.TokenDate.RangeRegex.test(innerToken)) {
      logger.debug(`3# INVALID TOKEN RangeRegex ${innerToken}`);
    }

    return regexes.some((regex) => regex.test(innerToken));
    //return SymbolsDate.TokenDate.FullRegex.test(innerToken) || SymbolsDate.TokenDate.RangeRegex.test(innerToken);
  }

  public static parseDateStringToken(token: string): Date {
    logger.debug(`PARSING TOKEN ${token} : ${this.parseDateStringToken.name}`);

    if (!this.isValidDateToken(token)) {
      throw new Error(
        `${this.parseDateStringToken.name} : ${TokenDateParser.errorInvalidStringTokenFormat} : ${token}`,
      );
    }

    // const innerToken = token.slice(1, -1); // Remove the surrounding brackets
    // logger.debug(`Remove the surrounding brackets : ${token} -> ${innerToken}: ${this.parseDateStringToken.name}`);
    return this.parseDateStringToken_internal(token);
  }

  // Used to decide the type of the Date Token and what method to be used to parse
  /* DateToken format - 
    Full : '[STARTDATE][+ve/-ve][DATEPART][+ve/-ve][DATEPART][+ve/-ve][DATEPART]';
    MonthStartEnd : '[MONTHENDSTART][MONTH][YEAR]';
    DateRange : '[MONTHENDSTART][MONTH][YEAR]<->[MONTHENDSTART][MONTH][YEAR]';
    */
  private static parseDateStringToken_internal(token: string): Date {
    logger.debug(`PARSING INNER TOKEN ${token} : ${this.parseDateStringToken_internal.name}`);
    let parsedDate = this.setToUnixZeroDate(); // Return unix zero time

    if (!this.isValidDateToken(token)) {
      throw new Error(
        `${this.parseDateStringToken_internal.name} : ${TokenDateParser.errorInvalidStringTokenFormat} : ${token}`,
      );
    }

    const innerToken = token.slice(1, -1); // Remove the surrounding brackets
    logger.debug(
      `Remove the surrounding brackets : ${token} -> ${innerToken}: ${this.parseDateStringToken_internal.name}`,
    );

    if (SymbolsDate.TokenDate.FullRegex.test(innerToken)) {
      logger.debug(`USING ${this.parseDateStringToken_Full.name} for ${token}`);
      parsedDate = this.parseDateStringToken_Full(token);
    } else if (SymbolsDate.TokenDate.RangeRegex.test(innerToken)) {
      logger.debug(`USING ${this.parseDateStringToken_MonthStartEnd_internal.name} for ${token}`);
      parsedDate = this.parseDateStringToken_MonthStartEnd_internal(innerToken);
    } else {
      throw new Error(
        `${this.parseDateStringToken_internal.name} : Unrecognised date token format : ${token}`,
      );
    }

    logger.debug(`TOKEN ${token} : PARSED DATE ${CommonUtils.toJSONString(parsedDate)}`);
    return parsedDate;
  }

  /* DateToken format - 
    Full : '[STARTDATE][+ve/-ve][DATEPART][+ve/-ve][DATEPART][+ve/-ve][DATEPART]';
    */
  static parseDateStringToken_Full(token: string): Date {
    logger.debug(`PARSING TOKEN ${token} : ${this.parseDateStringToken_Full.name}`);
    const innerToken = token.slice(1, -1); // Remove the surrounding brackets
    logger.debug(
      `Remove the surrounding brackets : ${token} -> ${innerToken}: ${this.parseDateStringToken_Full.name}`,
    );

    const match = SymbolsDate.TokenDate.FullRegex.exec(innerToken);
    logger.debug(
      `${this.parseDateStringToken_Full.name} : INNERTOKEN ${innerToken} : match ${CommonUtils.toJSONString(match)}`,
    );
    if (!match || !match.groups) {
      throw new Error(
        `${this.parseDateStringToken_Full.name} : ${TokenDateParser.errorInvalidStringTokenFormat} : ${token}`,
      );
    }

    logger.debug(
      `${this.parseDateStringToken_Full.name} : match.groups: ${CommonUtils.toJSONString(match.groups)}`,
    );
    let calculatedDate = this.getAnchorDate(match.groups["anchorDate"] as DateStartSection);

    let modificationTokenMatch;
    //Iterate through modification tokens, adjusting date
    while (
      (modificationTokenMatch = SymbolsDate.TokenDateInnerSectionRegex.exec(
        match.groups["adjustTokens"],
      )) !== null
    ) {
      if (modificationTokenMatch.groups) {
        logger.debug(
          `${this.parseDateStringToken_Full.name} : modificationTokenMatch.groups: ${CommonUtils.toJSONString(modificationTokenMatch.groups)}`,
        );
        const adjustValue =
          parseInt(modificationTokenMatch.groups["adjustValue"], 10) *
          (modificationTokenMatch.groups["sign"] === "+" ? 1 : -1);
        calculatedDate = this.adjustDate(
          calculatedDate,
          adjustValue,
          modificationTokenMatch.groups["dateUnit"] as DateUnitSection,
        );
      }
    }

    logger.debug(`TOKEN ${token} : PARSED DATE ${CommonUtils.toJSONString(calculatedDate)}`);
    return calculatedDate;
  }

  /* DateToken format - 
    MonthStartEnd : '[MONTHENDSTART][MONTH][YEAR]';
    */
  static parseDateStringToken_MonthStartEnd(token: string): Date {
    logger.debug(`PARSING TOKEN ${token} : ${this.parseDateStringToken_MonthStartEnd.name}`);
    if (!this.isValidDateToken(token)) {
      throw new Error(
        `${this.parseDateStringToken_MonthStartEnd.name} : ${TokenDateParser.errorInvalidStringTokenFormat} : ${token}`,
      );
    }
    const innerToken = token.slice(1, -1); // Remove the surrounding brackets
    logger.debug(
      `Remove the surrounding brackets : ${token} -> ${innerToken}: ${this.parseDateStringToken_MonthStartEnd.name}`,
    );
    const date = this.parseDateStringToken_MonthStartEnd_internal(innerToken);
    return date;
  }

  private static splitDateStringTokenPartial(token: string): string[] {
    const matches = token.match(SymbolsDate.TokenDate.RangeRegex);
    if (!matches) {
      throw new Error(
        `${this.splitDateStringTokenPartial.name} : ${TokenDateParser.errorInvalidStringTokenFormat} : ${token}`,
      );
    }
    return [matches[1], matches[2], matches[3]];
  }

  /* DateToken format - 
    DateRange : '[MONTHENDSTART][MONTH][YEAR]<->[MONTHENDSTART][MONTH][YEAR]';
    */
  static parseDateStringToken_DateRange(token: string): DateRange {
    // if (!this.isValidToken(token)) {
    //     throw new Error(`${this.parseDateRangeToken.name} isValidToken : ${errorInvalidStringTokenFormat} : ${token}`);
    // }
    const innerToken = token.slice(1, -1); // Remove the surrounding brackets
    logger.debug(
      `Remove the surrounding brackets : ${token} -> ${innerToken}: ${this.parseDateStringToken_DateRange.name}`,
    );
    const tokenParts = innerToken.split("<->");
    if (tokenParts.length !== 2) {
      throw new Error(
        `${this.parseDateStringToken_DateRange.name} : tokenParts.length[${tokenParts.length}]: ${TokenDateParser.errorInvalidStringTokenFormat} : ${token}`,
      );
    }

    let tokenParts_0 = `[${tokenParts[0]}]`;
    logger.debug(
      `tokenParts[0] : Add surrounding brackets : ${tokenParts[0]} -> ${tokenParts_0}: ${this.parseDateStringToken_DateRange.name}`,
    );
    let tokenParts_1 = `[${tokenParts[1]}]`;
    logger.debug(
      `tokenParts[0] : Add surrounding brackets : ${tokenParts[1]} -> ${tokenParts_1}: ${this.parseDateStringToken_DateRange.name}`,
    );

    const StartDate = this.parseDateStringToken_internal(tokenParts_0);
    const EndDate = this.parseDateStringToken_internal(tokenParts_1);

    return { Start: StartDate, End: EndDate };
  }

  private static parseDateStringToken_MonthStartEnd_internal(token: string): Date {
    logger.debug(`PARSING TOKEN ${token} : ${this.parseDateStringToken_MonthStartEnd.name}`);
    const [dateRangeMonthStartEndStr, monthStr, yearStr] = this.splitDateStringTokenPartial(token);
    const dateRangeMonthStartEnd =
      dateRangeMonthStartEndStr.toUpperCase() as DateRangeMonthStartEnd;
    const month = this.getMonthMap(monthStr);
    const year = parseInt(yearStr);

    if (isNaN(month) || isNaN(year)) {
      throw new Error(
        `${this.parseDateStringToken_MonthStartEnd_internal.name} : ${TokenDateParser.errorInvalidStringTokenFormat} : ${token}`,
      );
    }

    return this.computeMonthStartEndDate(dateRangeMonthStartEnd, month, year);
  }

  private static setToUnixZeroDate(): Date {
    let date = new Date(0); // Unix zero date: January 1, 1970, 00:00:00 UTC
    date.setHours(0, 0, 0, 0); // Zero out all time - set to midnight
    return date;
  }

  private static getAnchorDate(dateStartSection: DateStartSection): Date {
    let now = new Date();
    let adjustValue = 0;
    logger.debug(`1:startDateUTC: ${CommonUtils.toJSONString(now)}`);

    switch (dateStartSection) {
      case "TODAY":
        break;
      case "TOMORROW":
        adjustValue = 1;
        break;
      case "YESTERDAY":
        adjustValue = -1;
        break;
      default:
        logger.debug(`${dateStartSection} : UNRECOGNISED - Invalid start date`);
        throw new Error(`${dateStartSection} : UNRECOGNISED - Invalid start date`);
        break;
    }

    logger.debug(`${dateStartSection} : Adjusting DAY by ${adjustValue}`);
    now.setUTCDate(now.getUTCDate() + adjustValue);
    let calculted_startDateUTC = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0),
    );
    logger.debug(`2:StartDate: ${CommonUtils.toJSONString(calculted_startDateUTC)}`);
    return calculted_startDateUTC;
  }

  private static adjustDate(date: Date, adjustValue: number, dateUnit: DateUnitSection): Date {
    switch (dateUnit) {
      case "YEAR":
        date.setUTCFullYear(date.getUTCFullYear() + adjustValue);
        break;
      case "MONTH":
        date.setUTCMonth(date.getUTCMonth() + adjustValue);
        break;
      case "DAY":
        date.setUTCDate(date.getUTCDate() + adjustValue);
        break;
      default:
        logger.debug(`${dateUnit} : UNRECOGNISED - Invalid date section`);
        throw new Error(`${dateUnit} : UNRECOGNISED - Invalid date section`);
    }
    logger.debug(`Adjusting ${dateUnit} by ${adjustValue}`);
    logger.debug(`Adjusted date: ${CommonUtils.toJSONString(date)}`);
    return date;
  }

  private static getMonthMap(monthStr: string): number {
    return MonthEnum[monthStr as keyof typeof MonthEnum];
  }

  private static computeMonthStartEndDate(
    dateRangeMonthStartEnd: DateRangeMonthStartEnd,
    month: number,
    year: number,
  ): Date {
    //Default to setting first day of month
    let date = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));

    switch (dateRangeMonthStartEnd) {
      case "START":
        logger.debug(`Adjusting to the start of month`);
        date = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));
        break;
      case "END":
        logger.debug(`Adjusting to the end of month`);
        date = new Date(Date.UTC(year, month + 1, 0, 0, 0, 0, 0)); // Last day of the month
        break;
      default:
        logger.debug(
          `${dateRangeMonthStartEnd} : UNRECOGNISED - Invalid Date Range Month StartEnd`,
        );
        throw new Error(
          `${dateRangeMonthStartEnd} : UNRECOGNISED - Invalid Date Range Month StartEnd`,
        );
        break;
    }
    logger.debug(`MonthStartEndDate : ${CommonUtils.toJSONString(date)}`);
    return date;
  }
}
