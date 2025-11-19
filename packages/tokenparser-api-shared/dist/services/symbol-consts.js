"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SymbolsDS = exports.SymbolsDate = exports.SymbolsDT = exports.SymbolsOBS = void 0;
//### Conventions and representations Used ###
//
//Symbol Guidlines 																	| Examples
//------------------------------------------------------------------------------	| -------------------------------
//Use of one word 																	| CAPITALS
//More than one word use Pascal Case 												| FirstName and LastName
//Two part token, separate the differentiator aplha/numeric 						| CharSet XXX
//Avoid Kebab Case or Snake case, as can cause issues when trying to parse	    	| kebab-case or snake_case
//
//Symbol  						                                					//| Explanation
//-------------------------------                               					//| -------------------------------
class SymbolsOBS {
    static OnyxUserId = "[OnyxUserId]"; //| The Onyx User Id used for testing
    static OnyxManagerUserId = "[OnyxManagerUserId]"; //| The Onyx Manager User Id used for testing
    static OnyxDefaultPassword = "[OnyxDefaultPassword]"; //| The default Password for Onyx test users
    static QualManagerUserId = "[QualManagerUserId]"; //| The Qualifications Manager User Id used for testing
    static QualManagerPassword = "[QualManagerPassword]"; //| The default Password for Qualifications Manager test users
    static TopazUserId = "[TopazUserId]"; //| The Topaz User Id used for testing
    static TopazPassword = "[TopazPassword]"; //| The default Password for Topaz test users
    static VALID_fuzzysearchend = "[VALID] +fuzzysearchend:"; //| Indicates valid data + amended with substring for fuzzy search (end of value)
    static VALID_fuzzysearchmiddle = "[VALID] +fuzzysearchmiddle:"; //| Indicates valid data + amended with substring for fuzzy search (middle of value)
    static AdvRefNoInfoToEnter = "[NoInfoToEnter]"; //| Indicates that the No Information to enter checkbox should be checked for a Reference Section in the Adviser Portal
    static maxSupportedCycleYear = "[MaxSupportedCycle]"; //| Indicates the Maximum Supported Cycle Year
}
exports.SymbolsOBS = SymbolsOBS;
class SymbolsDT {
    static VALID = "[VALID]"; //| Enter or Select any valid data for field
    static UPDATEVALID = "[UPDATEVALID]"; //| Indicates an update to valid data for data field
    static UPDATEINVALID = "[UPDATEINVALID]"; //| Indicates an update to NON valid data for data field
    static BLANK = "[BLANK]"; //| Indicates the field should be blank/empty entry
    static UPDATEBLANK = "[UPDATEBLANK]"; //| Indicates an update from some value to a blank/empty entry
    static IGNORE = "[IGNORE]"; //| Indicates the field should be ignored from data entry or data updates.
}
exports.SymbolsDT = SymbolsDT;
class SymbolsDate {
    ///TEMPORARY UNTIL ALL CODE REFACTORS THESE TOKENS OUT
    static TODAY = "[TODAY]"; //| Current system date
    static TOMORROW = "[TOMORROW]"; //| Tomorrow's  system date
    static YESTERDAY = "[YESTERDAY]"; //| Yesterday's system date
    ///
    static BracketedTokenRegex = /^\[.*\]$/; //| Regex pattern for tokens enclosed in brackets (All tokens MUST start and end with these)
    static TokenDate = {
        FullRegex: /^(?<anchorDate>TODAY|TOMORROW|YESTERDAY)(?<adjustTokens>([+-]\d+(YEAR|MONTH|DAY))*)$/,
        RangeRegex: /^(START|END)-(\w+)-(\d{4})$/,
    };
    static TokenDateInnerSectionRegex = /(?<token>(?<sign>[+-])(?<adjustValue>\d+)(?<dateUnit>YEAR|MONTH|DAY))/g;
}
exports.SymbolsDate = SymbolsDate;
class SymbolsDS {
    // Constants for the different types of characters
    static ALPHA = "ALPHA"; //| Aplha  characters
    static NUMERIC = "NUMERIC"; //| Numeric characters
    static PUNCTUATION = "PUNCTUATION"; //| punctuation characters
    static SPECIAL = "SPECIAL"; //| special characters
    static LINES = "LINES"; //| indicates lines of repeated tokens
    static ALL = "ALL"; //| indicates all characters from pools
    // Regular expression to match the Dynamic String token format
    // regex also handles the optional LINES-XXX part
    static DynamicStringRegex = /\[(?<types>(?:(?:ALPHA|NUMERIC|PUNCTUATION|SPECIAL)(?:-(?!-))?)+)-(?<length>(?:[1-9]\d*|ALL))(?:-LINES-(?<lines>\d+))?\]/;
}
exports.SymbolsDS = SymbolsDS;
