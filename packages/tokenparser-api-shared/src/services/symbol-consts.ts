export class SymbolsOBS {
  static readonly OnyxUserId = "[OnyxUserId]";
  static readonly OnyxManagerUserId = "[OnyxManagerUserId]";
  static readonly OnyxDefaultPassword = "[OnyxDefaultPassword]";
  static readonly QualManagerUserId = "[QualManagerUserId]";
  static readonly QualManagerPassword = "[QualManagerPassword]";
  static readonly TopazUserId = "[TopazUserId]";
  static readonly TopazPassword = "[TopazPassword]";

  static readonly VALID_fuzzysearchend = "[VALID] +fuzzysearchend:";
  static readonly VALID_fuzzysearchmiddle = "[VALID] +fuzzysearchmiddle:";

  static readonly AdvRefNoInfoToEnter = "[NoInfoToEnter]";
  static readonly maxSupportedCycleYear = "[MaxSupportedCycle]";
}

export class SymbolsDT {
  static readonly VALID = "[VALID]";
  static readonly UPDATEVALID = "[UPDATEVALID]";
  static readonly UPDATEINVALID = "[UPDATEINVALID]";
  static readonly BLANK = "[BLANK]";
  static readonly UPDATEBLANK = "[UPDATEBLANK]";
  static readonly IGNORE = "[IGNORE]";
}

export class SymbolsDate {
  static readonly TODAY = "[TODAY]";
  static readonly TOMORROW = "[TOMORROW]";
  static readonly YESTERDAY = "[YESTERDAY]";

  static readonly BracketedTokenRegex = /^\[.*\]$/;
  static readonly TokenDate = {
    FullRegex:
      /^(?<anchorDate>TODAY|TOMORROW|YESTERDAY)(?<adjustTokens>([+-]\d+(YEAR|MONTH|DAY))*)$/,
    RangeRegex: /^(START|END)-(\w+)-(\d{4})$/,
  };
  static readonly TokenDateInnerSectionRegex =
    /(?<token>(?<sign>[+-])(?<adjustValue>\d+)(?<dateUnit>YEAR|MONTH|DAY))/g;
}

export class SymbolsDS {
  public static readonly ALPHA = "ALPHA";
  public static readonly NUMERIC = "NUMERIC";
  public static readonly PUNCTUATION = "PUNCTUATION";
  public static readonly SPECIAL = "SPECIAL";
  public static readonly LINES = "LINES";
  public static readonly ALL = "ALL";

  public static readonly DynamicStringRegex =
    /\[(?<types>(?:(?:ALPHA|NUMERIC|PUNCTUATION|SPECIAL)(?:-(?!-))?)+)-(?<length>(?:[1-9]\d*|ALL))(?:-LINES-(?<lines>\d+))?\]/;
}
