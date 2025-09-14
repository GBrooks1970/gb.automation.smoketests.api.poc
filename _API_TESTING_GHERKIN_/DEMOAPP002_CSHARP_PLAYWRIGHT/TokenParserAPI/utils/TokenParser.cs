namespace TokenParserAPI.utils
{
    public static class TokenParser
    {
        private static string _token;
        private static string _parsedOutput;
        private static DateTime _parsedDateOutput;
        private static TokenDynamicStringParser _tokenDynamicStringParser = new TokenDynamicStringParser();
        private static ParsedTokenParser _ParsedTokenParser = new ParsedTokenParser();

        public static string ParseDateToken(string token)
        {
            _token = token;
            _parsedDateOutput = _ParsedTokenParser.ParseToken(_token);
            _parsedOutput = _parsedDateOutput.ToString("u");
            return _parsedOutput;
        }

        public static string ParseDynamicStringToken(string token)
        {
            _token = token;
            _parsedOutput = _tokenDynamicStringParser.ParseToken(_token);

            return _parsedOutput;
        }
    }
}
