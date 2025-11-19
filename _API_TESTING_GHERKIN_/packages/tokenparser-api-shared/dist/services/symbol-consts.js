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
}
exports.SymbolsOBS = SymbolsOBS;
SymbolsOBS.OnyxUserId = "[OnyxUserId]"; //| The Onyx User Id used for testing
SymbolsOBS.OnyxManagerUserId = "[OnyxManagerUserId]"; //| The Onyx Manager User Id used for testing
SymbolsOBS.OnyxDefaultPassword = "[OnyxDefaultPassword]"; //| The default Password for Onyx test users
SymbolsOBS.QualManagerUserId = "[QualManagerUserId]"; //| The Qualifications Manager User Id used for testing
SymbolsOBS.QualManagerPassword = "[QualManagerPassword]"; //| The default Password for Qualifications Manager test users
SymbolsOBS.TopazUserId = "[TopazUserId]"; //| The Topaz User Id used for testing
SymbolsOBS.TopazPassword = "[TopazPassword]"; //| The default Password for Topaz test users
SymbolsOBS.VALID_fuzzysearchend = "[VALID] +fuzzysearchend:"; //| Indicates valid data + amended with substring for fuzzy search (end of value)
SymbolsOBS.VALID_fuzzysearchmiddle = "[VALID] +fuzzysearchmiddle:"; //| Indicates valid data + amended with substring for fuzzy search (middle of value)
SymbolsOBS.AdvRefNoInfoToEnter = "[NoInfoToEnter]"; //| Indicates that the No Information to enter checkbox should be checked for a Reference Section in the Adviser Portal
SymbolsOBS.maxSupportedCycleYear = "[MaxSupportedCycle]"; //| Indicates the Maximum Supported Cycle Year
class SymbolsDT {
}
exports.SymbolsDT = SymbolsDT;
SymbolsDT.VALID = "[VALID]"; //| Enter or Select any valid data for field
SymbolsDT.UPDATEVALID = "[UPDATEVALID]"; //| Indicates an update to valid data for data field
SymbolsDT.UPDATEINVALID = "[UPDATEINVALID]"; //| Indicates an update to NON valid data for data field
SymbolsDT.BLANK = "[BLANK]"; //| Indicates the field should be blank/empty entry
SymbolsDT.UPDATEBLANK = "[UPDATEBLANK]"; //| Indicates an update from some value to a blank/empty entry
SymbolsDT.IGNORE = "[IGNORE]"; //| Indicates the field should be ignored from data entry or data updates.
class SymbolsDate {
}
exports.SymbolsDate = SymbolsDate;
///TEMPORARY UNTIL ALL CODE REFACTORS THESE TOKENS OUT
SymbolsDate.TODAY = "[TODAY]"; //| Current system date
SymbolsDate.TOMORROW = "[TOMORROW]"; //| Tomorrow's  system date
SymbolsDate.YESTERDAY = "[YESTERDAY]"; //| Yesterday's system date
///
SymbolsDate.BracketedTokenRegex = /^\[.*\]$/; //| Regex pattern for tokens enclosed in brackets (All tokens MUST start and end with these)
SymbolsDate.TokenDate = {
    FullRegex: /^(?<anchorDate>TODAY|TOMORROW|YESTERDAY)(?<adjustTokens>([+-]\d+(YEAR|MONTH|DAY))*)$/,
    RangeRegex: /^(START|END)-(\w+)-(\d{4})$/,
};
SymbolsDate.TokenDateInnerSectionRegex = /(?<token>(?<sign>[+-])(?<adjustValue>\d+)(?<dateUnit>YEAR|MONTH|DAY))/g;
class SymbolsDS {
}
exports.SymbolsDS = SymbolsDS;
// Constants for the different types of characters
SymbolsDS.ALPHA = "ALPHA"; //| Aplha  characters
SymbolsDS.NUMERIC = "NUMERIC"; //| Numeric characters
SymbolsDS.PUNCTUATION = "PUNCTUATION"; //| punctuation characters
SymbolsDS.SPECIAL = "SPECIAL"; //| special characters
SymbolsDS.LINES = "LINES"; //| indicates lines of repeated tokens
SymbolsDS.ALL = "ALL"; //| indicates all characters from pools
// Regular expression to match the Dynamic String token format
// regex also handles the optional LINES-XXX part
SymbolsDS.DynamicStringRegex = /\[(?<types>(?:(?:ALPHA|NUMERIC|PUNCTUATION|SPECIAL)(?:-(?!-))?)+)-(?<length>(?:[1-9]\d*|ALL))(?:-LINES-(?<lines>\d+))?\]/;
