namespace TokenParserAPI.utils
{
    public static class TokenParser
    {
        private static readonly TokenDynamicStringParser TokenDynamicStringParser = new();
        private static readonly ParsedTokenParser ParsedTokenParser = new();

        public static string ParseDateToken(string token)
        {
            var parsedDate = ParsedTokenParser.ParseToken(token);
            return DateFormatting.FormatUtc(parsedDate);
        }

        public static string ParseDynamicStringToken(string token)
        {
            return TokenDynamicStringParser.ParseToken(token);
        }
    }
}
