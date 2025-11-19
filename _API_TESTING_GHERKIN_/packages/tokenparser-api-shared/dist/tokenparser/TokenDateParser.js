"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenDateParser = exports.MonthEnum = void 0;
const common_utils_1 = __importDefault(require("../services/common-utils"));
const symbol_consts_1 = require("../services/symbol-consts");
const logger_1 = require("../services/logger");
var MonthEnum;
(function (MonthEnum) {
    MonthEnum[MonthEnum["JANUARY"] = 0] = "JANUARY";
    MonthEnum[MonthEnum["FEBRUARY"] = 1] = "FEBRUARY";
    MonthEnum[MonthEnum["MARCH"] = 2] = "MARCH";
    MonthEnum[MonthEnum["APRIL"] = 3] = "APRIL";
    MonthEnum[MonthEnum["MAY"] = 4] = "MAY";
    MonthEnum[MonthEnum["JUNE"] = 5] = "JUNE";
    MonthEnum[MonthEnum["JULY"] = 6] = "JULY";
    MonthEnum[MonthEnum["AUGUST"] = 7] = "AUGUST";
    MonthEnum[MonthEnum["SEPTEMBER"] = 8] = "SEPTEMBER";
    MonthEnum[MonthEnum["OCTOBER"] = 9] = "OCTOBER";
    MonthEnum[MonthEnum["NOVEMBER"] = 10] = "NOVEMBER";
    MonthEnum[MonthEnum["DECEMBER"] = 11] = "DECEMBER";
})(MonthEnum || (exports.MonthEnum = MonthEnum = {}));
const logger = (0, logger_1.createLogger)("TokenDateParser");
class TokenDateParser {
    static isValidDateToken(token) {
        try {
            logger.debug(`VALIDATING ${token}`);
            if (symbol_consts_1.SymbolsDate.BracketedTokenRegex.test(token)) {
                logger.debug(`FOUND-TOKEN BRACKETS -> token: ${common_utils_1.default.toJSONString(token)}`);
                const innerToken = token.slice(1, -1); // Remove the surrounding brackets
                return this.isValidInnerToken(innerToken);
            }
        }
        catch (error) {
            logger.debug(`${this.isValidDateToken.name}: ERROR VALIDATING TOKEN DATE ${token} : ${error}`);
            return false;
        }
        logger.debug(`1# INVALID TOKEN ${token}`);
        return false;
    }
    static isValidInnerToken(innerToken) {
        logger.debug(`VALIDATING InnerToken ${innerToken}`);
        const regexes = Object.values(symbol_consts_1.SymbolsDate.TokenDate);
        if (!symbol_consts_1.SymbolsDate.TokenDate.FullRegex.test(innerToken)) {
            logger.debug(`2# INVALID TOKEN FullRegex ${innerToken}`);
        }
        if (!symbol_consts_1.SymbolsDate.TokenDate.RangeRegex.test(innerToken)) {
            logger.debug(`3# INVALID TOKEN RangeRegex ${innerToken}`);
        }
        return regexes.some((regex) => regex.test(innerToken));
        //return SymbolsDate.TokenDate.FullRegex.test(innerToken) || SymbolsDate.TokenDate.RangeRegex.test(innerToken);
    }
    static parseDateStringToken(token) {
        logger.debug(`PARSING TOKEN ${token} : ${this.parseDateStringToken.name}`);
        if (!this.isValidDateToken(token)) {
            throw new Error(`${this.parseDateStringToken.name} : ${TokenDateParser.errorInvalidStringTokenFormat} : ${token}`);
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
    static parseDateStringToken_internal(token) {
        logger.debug(`PARSING INNER TOKEN ${token} : ${this.parseDateStringToken_internal.name}`);
        let parsedDate = this.setToUnixZeroDate(); // Return unix zero time
        if (!this.isValidDateToken(token)) {
            throw new Error(`${this.parseDateStringToken_internal.name} : ${TokenDateParser.errorInvalidStringTokenFormat} : ${token}`);
        }
        const innerToken = token.slice(1, -1); // Remove the surrounding brackets
        logger.debug(`Remove the surrounding brackets : ${token} -> ${innerToken}: ${this.parseDateStringToken_internal.name}`);
        if (symbol_consts_1.SymbolsDate.TokenDate.FullRegex.test(innerToken)) {
            logger.debug(`USING ${this.parseDateStringToken_Full.name} for ${token}`);
            parsedDate = this.parseDateStringToken_Full(token);
        }
        else if (symbol_consts_1.SymbolsDate.TokenDate.RangeRegex.test(innerToken)) {
            logger.debug(`USING ${this.parseDateStringToken_MonthStartEnd_internal.name} for ${token}`);
            parsedDate = this.parseDateStringToken_MonthStartEnd_internal(innerToken);
        }
        else {
            throw new Error(`${this.parseDateStringToken_internal.name} : Unrecognised date token format : ${token}`);
        }
        logger.debug(`TOKEN ${token} : PARSED DATE ${common_utils_1.default.toJSONString(parsedDate)}`);
        return parsedDate;
    }
    /* DateToken format -
      Full : '[STARTDATE][+ve/-ve][DATEPART][+ve/-ve][DATEPART][+ve/-ve][DATEPART]';
      */
    static parseDateStringToken_Full(token) {
        logger.debug(`PARSING TOKEN ${token} : ${this.parseDateStringToken_Full.name}`);
        const innerToken = token.slice(1, -1); // Remove the surrounding brackets
        logger.debug(`Remove the surrounding brackets : ${token} -> ${innerToken}: ${this.parseDateStringToken_Full.name}`);
        const match = symbol_consts_1.SymbolsDate.TokenDate.FullRegex.exec(innerToken);
        logger.debug(`${this.parseDateStringToken_Full.name} : INNERTOKEN ${innerToken} : match ${common_utils_1.default.toJSONString(match)}`);
        if (!match || !match.groups) {
            throw new Error(`${this.parseDateStringToken_Full.name} : ${TokenDateParser.errorInvalidStringTokenFormat} : ${token}`);
        }
        logger.debug(`${this.parseDateStringToken_Full.name} : match.groups: ${common_utils_1.default.toJSONString(match.groups)}`);
        let calculatedDate = this.getAnchorDate(match.groups["anchorDate"]);
        let modificationTokenMatch;
        //Iterate through modification tokens, adjusting date
        while ((modificationTokenMatch = symbol_consts_1.SymbolsDate.TokenDateInnerSectionRegex.exec(match.groups["adjustTokens"])) !== null) {
            if (modificationTokenMatch.groups) {
                logger.debug(`${this.parseDateStringToken_Full.name} : modificationTokenMatch.groups: ${common_utils_1.default.toJSONString(modificationTokenMatch.groups)}`);
                const adjustValue = parseInt(modificationTokenMatch.groups["adjustValue"], 10) *
                    (modificationTokenMatch.groups["sign"] === "+" ? 1 : -1);
                calculatedDate = this.adjustDate(calculatedDate, adjustValue, modificationTokenMatch.groups["dateUnit"]);
            }
        }
        logger.debug(`TOKEN ${token} : PARSED DATE ${common_utils_1.default.toJSONString(calculatedDate)}`);
        return calculatedDate;
    }
    /* DateToken format -
      MonthStartEnd : '[MONTHENDSTART][MONTH][YEAR]';
      */
    static parseDateStringToken_MonthStartEnd(token) {
        logger.debug(`PARSING TOKEN ${token} : ${this.parseDateStringToken_MonthStartEnd.name}`);
        if (!this.isValidDateToken(token)) {
            throw new Error(`${this.parseDateStringToken_MonthStartEnd.name} : ${TokenDateParser.errorInvalidStringTokenFormat} : ${token}`);
        }
        const innerToken = token.slice(1, -1); // Remove the surrounding brackets
        logger.debug(`Remove the surrounding brackets : ${token} -> ${innerToken}: ${this.parseDateStringToken_MonthStartEnd.name}`);
        const date = this.parseDateStringToken_MonthStartEnd_internal(innerToken);
        return date;
    }
    static splitDateStringTokenPartial(token) {
        const matches = token.match(symbol_consts_1.SymbolsDate.TokenDate.RangeRegex);
        if (!matches) {
            throw new Error(`${this.splitDateStringTokenPartial.name} : ${TokenDateParser.errorInvalidStringTokenFormat} : ${token}`);
        }
        return [matches[1], matches[2], matches[3]];
    }
    /* DateToken format -
      DateRange : '[MONTHENDSTART][MONTH][YEAR]<->[MONTHENDSTART][MONTH][YEAR]';
      */
    static parseDateStringToken_DateRange(token) {
        // if (!this.isValidToken(token)) {
        //     throw new Error(`${this.parseDateRangeToken.name} isValidToken : ${errorInvalidStringTokenFormat} : ${token}`);
        // }
        const innerToken = token.slice(1, -1); // Remove the surrounding brackets
        logger.debug(`Remove the surrounding brackets : ${token} -> ${innerToken}: ${this.parseDateStringToken_DateRange.name}`);
        const tokenParts = innerToken.split("<->");
        if (tokenParts.length !== 2) {
            throw new Error(`${this.parseDateStringToken_DateRange.name} : tokenParts.length[${tokenParts.length}]: ${TokenDateParser.errorInvalidStringTokenFormat} : ${token}`);
        }
        let tokenParts_0 = `[${tokenParts[0]}]`;
        logger.debug(`tokenParts[0] : Add surrounding brackets : ${tokenParts[0]} -> ${tokenParts_0}: ${this.parseDateStringToken_DateRange.name}`);
        let tokenParts_1 = `[${tokenParts[1]}]`;
        logger.debug(`tokenParts[0] : Add surrounding brackets : ${tokenParts[1]} -> ${tokenParts_1}: ${this.parseDateStringToken_DateRange.name}`);
        const StartDate = this.parseDateStringToken_internal(tokenParts_0);
        const EndDate = this.parseDateStringToken_internal(tokenParts_1);
        return { Start: StartDate, End: EndDate };
    }
    static parseDateStringToken_MonthStartEnd_internal(token) {
        logger.debug(`PARSING TOKEN ${token} : ${this.parseDateStringToken_MonthStartEnd.name}`);
        const [dateRangeMonthStartEndStr, monthStr, yearStr] = this.splitDateStringTokenPartial(token);
        const dateRangeMonthStartEnd = dateRangeMonthStartEndStr.toUpperCase();
        const month = this.getMonthMap(monthStr);
        const year = parseInt(yearStr);
        if (isNaN(month) || isNaN(year)) {
            throw new Error(`${this.parseDateStringToken_MonthStartEnd_internal.name} : ${TokenDateParser.errorInvalidStringTokenFormat} : ${token}`);
        }
        return this.computeMonthStartEndDate(dateRangeMonthStartEnd, month, year);
    }
    static setToUnixZeroDate() {
        let date = new Date(0); // Unix zero date: January 1, 1970, 00:00:00 UTC
        date.setHours(0, 0, 0, 0); // Zero out all time - set to midnight
        return date;
    }
    static getAnchorDate(dateStartSection) {
        let now = new Date();
        let adjustValue = 0;
        logger.debug(`1:startDateUTC: ${common_utils_1.default.toJSONString(now)}`);
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
        let calculted_startDateUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
        logger.debug(`2:StartDate: ${common_utils_1.default.toJSONString(calculted_startDateUTC)}`);
        return calculted_startDateUTC;
    }
    static adjustDate(date, adjustValue, dateUnit) {
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
        logger.debug(`Adjusted date: ${common_utils_1.default.toJSONString(date)}`);
        return date;
    }
    static getMonthMap(monthStr) {
        return MonthEnum[monthStr];
    }
    static computeMonthStartEndDate(dateRangeMonthStartEnd, month, year) {
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
                logger.debug(`${dateRangeMonthStartEnd} : UNRECOGNISED - Invalid Date Range Month StartEnd`);
                throw new Error(`${dateRangeMonthStartEnd} : UNRECOGNISED - Invalid Date Range Month StartEnd`);
                break;
        }
        logger.debug(`MonthStartEndDate : ${common_utils_1.default.toJSONString(date)}`);
        return date;
    }
}
exports.TokenDateParser = TokenDateParser;
TokenDateParser.errorInvalidStringTokenFormat = "Invalid string token format";
