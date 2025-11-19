export declare class TokenDynamicStringParser {
    private static readonly ALPHA_CHARS;
    private static readonly NUMERIC_CHARS;
    private static readonly PUNCTUATION_CHARS;
    private static readonly SPECIAL_CHARS;
    private static readonly errorInvalidStringTokenFormat;
    static isValidDynamicStringToken(token: string): boolean;
    private static tryParseInt;
    static parseAndGenerate(token: string): string;
}
