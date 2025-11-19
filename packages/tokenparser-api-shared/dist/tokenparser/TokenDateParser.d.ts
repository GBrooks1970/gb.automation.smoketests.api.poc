export type DateUnitSection = "YEAR" | "MONTH" | "DAY";
export type DateStartSection = "TODAY" | "TOMORROW" | "YESTERDAY";
export type DateRangeMonthStartEnd = "START" | "END";
export declare enum MonthEnum {
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
    DECEMBER = 11
}
export interface DateRange {
    Start: Date;
    End: Date;
}
export type DateTokenFormats = {
    Full: "[STARTDATE][+ve/-ve][DATEPART][+ve/-ve][DATEPART][+ve/-ve][DATEPART]";
    MonthStartEnd: "[MONTHENDSTART][MONTH][YEAR]";
    DateRange: "[MONTHENDSTART][MONTH][YEAR]<->[MONTHENDSTART][MONTH][YEAR]";
};
export declare class TokenDateParser {
    static readonly errorInvalidStringTokenFormat = "Invalid string token format";
    static isValidDateToken(token: string): boolean;
    static isValidInnerToken(innerToken: string): boolean;
    static parseDateStringToken(token: string): Date;
    private static parseDateStringToken_internal;
    static parseDateStringToken_Full(token: string): Date;
    static parseDateStringToken_MonthStartEnd(token: string): Date;
    private static splitDateStringTokenPartial;
    static parseDateStringToken_DateRange(token: string): DateRange;
    private static parseDateStringToken_MonthStartEnd_internal;
    private static setToUnixZeroDate;
    private static getAnchorDate;
    private static adjustDate;
    private static getMonthMap;
    private static computeMonthStartEndDate;
}
//# sourceMappingURL=TokenDateParser.d.ts.map