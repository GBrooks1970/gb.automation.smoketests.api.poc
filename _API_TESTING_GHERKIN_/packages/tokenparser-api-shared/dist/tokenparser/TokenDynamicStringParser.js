"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenDynamicStringParser = void 0;
const common_utils_1 = __importDefault(require("../services/common-utils"));
const symbol_consts_1 = require("../services/symbol-consts");
const logger_1 = require("../services/logger");
/*
Utility class that parses tokens with the specified format and generates a string based on the inputted token.
The token can have combinations of ALPHA, NUMERIC, PUNCTUATION, and SPECIAL,
followed by a number that specifies the length of the string to be generated.
*/
const logger = (0, logger_1.createLogger)("TokenDynamicStringParser");
class TokenDynamicStringParser {
    static isValidDynamicStringToken(token) {
        try {
            const match = token.match(symbol_consts_1.SymbolsDS.DynamicStringRegex);
            if (match && match.groups) {
                return true;
            }
        }
        catch (error) {
            logger.error(`${this.isValidDynamicStringToken.name}: ERROR VALIDATING TOKEN DYNAMIC STRING ${token} : ${error}`);
            return false;
        }
        return false;
    }
    static tryParseInt(value) {
        const parsed = Number.parseInt(value, 10);
        return Number.isNaN(parsed) ? Number.NaN : parsed;
    }
    static parseAndGenerate(token) {
        const match = token.match(symbol_consts_1.SymbolsDS.DynamicStringRegex);
        if (!match || !match.groups) {
            throw new Error(`${TokenDynamicStringParser.name} : ${TokenDynamicStringParser.errorInvalidStringTokenFormat} : ${token}`);
        }
        const { types, length, lines } = match.groups;
        // types - // ALPHA, NUMERIC, PUNCTUATION, SPECIAL
        // length - amount of characters on one line
        // lines - line count - Default to 1 line if LINES-XXX is not provided
        const lengthToken = length.trim();
        const normalizedLength = lengthToken.toUpperCase();
        const isAllLength = normalizedLength === symbol_consts_1.SymbolsDS.ALL;
        const parsedLength = isAllLength ? Number.NaN : this.tryParseInt(lengthToken);
        const linesNum = lines ? parseInt(lines, 10) : 1; // Default to 1 line if LINES-XXX is not provided
        logger.debug(`TOKEN ${token} : types ${common_utils_1.default.toJSONString(types)}`);
        logger.debug(`TOKEN ${token} : length ${common_utils_1.default.toJSONString(lengthToken)}`);
        logger.debug(`TOKEN ${token} : lines ${common_utils_1.default.toJSONString(lines)}`);
        logger.debug(`TOKEN ${token} : lengthValue ${common_utils_1.default.toJSONString(lengthToken)}`);
        logger.debug(`TOKEN ${token} : linesNum ${common_utils_1.default.toJSONString(linesNum)}`);
        if (!isAllLength) {
            if (!Number.isInteger(parsedLength) || parsedLength <= 0) {
                throw new Error(`${TokenDynamicStringParser.name} : Invalid length in token: ${token}`);
            }
        }
        if (!Number.isInteger(linesNum) || linesNum <= 0) {
            throw new Error(`${TokenDynamicStringParser.name} : Invalid line count in token: ${token}`);
        }
        // Determine the character set based on the token types
        let charSet = "";
        types.split("-").forEach((type) => {
            switch (type) {
                case symbol_consts_1.SymbolsDS.ALPHA:
                    charSet += TokenDynamicStringParser.ALPHA_CHARS;
                    break;
                case symbol_consts_1.SymbolsDS.NUMERIC:
                    charSet += TokenDynamicStringParser.NUMERIC_CHARS;
                    break;
                case symbol_consts_1.SymbolsDS.PUNCTUATION:
                    charSet += TokenDynamicStringParser.PUNCTUATION_CHARS;
                    break;
                case symbol_consts_1.SymbolsDS.SPECIAL:
                    charSet += TokenDynamicStringParser.SPECIAL_CHARS;
                    break;
            }
        });
        logger.debug(`TOKEN ${token} : charSet '${common_utils_1.default.toJSONString(charSet)}'`);
        if (charSet === "") {
            throw new Error(`${TokenDynamicStringParser.name} : No valid character types found in token: ${token}`);
        }
        let result = "";
        for (let line = 0; line < linesNum; line++) {
            let lineResult = "";
            if (isAllLength) {
                logger.debug(`TOKEN ${token} : ALL charSet '${common_utils_1.default.toJSONString(charSet)}'`);
                lineResult += charSet;
            }
            else {
                for (let i = 0; i < parsedLength; i++) {
                    const randomIndex = Math.floor(Math.random() * charSet.length);
                    lineResult += charSet[randomIndex];
                }
            }
            logger.debug(`TOKEN ${token} : Generated string LINE[${line}]'${common_utils_1.default.toJSONString(lineResult)}'`);
            result += lineResult;
            if (line < linesNum - 1) {
                result += "\r\n"; // Add carriage return and line feed between lines
            }
        }
        logger.debug(`TOKEN ${token} : Generated string '${common_utils_1.default.toJSONString(result)}'`);
        return result;
    }
}
exports.TokenDynamicStringParser = TokenDynamicStringParser;
// Character sets for different token types
TokenDynamicStringParser.ALPHA_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
TokenDynamicStringParser.NUMERIC_CHARS = "0123456789";
TokenDynamicStringParser.PUNCTUATION_CHARS = ".,!?;:";
TokenDynamicStringParser.SPECIAL_CHARS = "!@#$%^&*()_+[]{}|;:,.<>?";
TokenDynamicStringParser.errorInvalidStringTokenFormat = "Invalid string token format ";
