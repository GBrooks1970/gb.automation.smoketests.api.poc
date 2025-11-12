using System.Text;
using System.Text.RegularExpressions;
using TokenParserAPI.Logging;

namespace TokenParserAPI.utils
{
    public static class SymbolsDS
    {
        public const string ALPHA = "ALPHA";
        public const string NUMERIC = "NUMERIC";
        public const string PUNCTUATION = "PUNCTUATION";
        public const string SPECIAL = "SPECIAL";
        public const string LINES = "LINES";
        public const string ALL = "ALL"; // New token for using all characters from pools

        // New regex pattern to capture types, length (ALL or number), and lines
        public const string TokenPattern = @"\[(?<types>(?:(?:ALPHA|NUMERIC|PUNCTUATION|SPECIAL)(?:-(?!-))?)+)-(?<length>\d+|ALL)(?:-LINES-(?<lines>\d+))?\]";
    }

    public class TokenDynamicStringParser
    {
        private static readonly TokenParserLogger Logger = TokenParserLogger.For(nameof(TokenDynamicStringParser));
        private static readonly Random _random = new Random();
        private const string AlphaChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
        private const string NumericChars = "0123456789";
        private const string PunctuationChars = ".,!?;:";
        private const string SpecialChars = "!@#$%^&*()_+[]{}|;:,.<>?";

        public string ParseToken(string token)
        {
            var regex = new Regex(SymbolsDS.TokenPattern);
            var match = regex.Match(token);

            if (!match.Success)
                throw new ArgumentException("Invalid string token format");

            string types = match.Groups["types"].Value;
            string lengthValue = match.Groups["length"].Value;
            int lineCount = match.Groups["lines"].Success ? int.Parse(match.Groups["lines"].Value) : 1;

            Logger.Debug("Parsing dynamic string token {0}", token);
            Logger.Debug("Token breakdown types={0}, length={1}, lines={2}", types, lengthValue, lineCount);

            bool useAllCharacters = lengthValue == SymbolsDS.ALL;
            int count = useAllCharacters ? 0 : int.Parse(lengthValue); // If ALL, count will be handled later.
            if (!useAllCharacters && count <= 0)
            {
                throw new ArgumentException("Invalid string token format");
            }

            string ParsedToken = GenerateString(types, count, useAllCharacters);
            Logger.Debug("Generated base string {0}", ParsedToken);
            var result = GenerateLines(ParsedToken, lineCount);
            Logger.Debug("Generated string result with line count {0}: {1}", lineCount, result);
            return result;
        }

        private string GenerateString(string types, int count, bool useAllCharacters)
        {
            var charPool = new StringBuilder();
            Logger.Debug("Building character pool for types {0}", types);

            // Build the pool of possible characters based on the token types
            if (types.Contains(SymbolsDS.ALPHA))
                charPool.Append(AlphaChars);
            if (types.Contains(SymbolsDS.NUMERIC))
                charPool.Append(NumericChars);
            if (types.Contains(SymbolsDS.PUNCTUATION))
                charPool.Append(PunctuationChars);
            if (types.Contains(SymbolsDS.SPECIAL))
                charPool.Append(SpecialChars);

            Logger.Debug("Character pool size {0}. useAllCharacters={1}", charPool.Length, useAllCharacters);

            // If ALL is specified, use all characters in the pool once in the output
            if (useAllCharacters)
            {
                return ShuffleString(charPool.ToString());
            }

            // Otherwise, randomly pick `count` characters from the pool
            return GenerateRandomStringFromPool(charPool.ToString(), count);
        }

        private string GenerateRandomStringFromPool(string charPool, int count)
        {
            Logger.Debug("Generating random string from pool length {0} with count {1}", charPool.Length, count);
            var result = new StringBuilder();
            for (int i = 0; i < count; i++)
            {
                int randomIndex = _random.Next(charPool.Length);
                result.Append(charPool[randomIndex]);
            }
            return result.ToString();
        }

        private string GenerateLines(string parsedToken, int lineCount)
        {
            if (lineCount <= 0)
            {
                throw new ArgumentException("Invalid line count in token format");
            }

            Logger.Debug("Applying line count {0}", lineCount);

            if (lineCount == 1)
            {
                return parsedToken;
            }

            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < lineCount; i++)
            {
                if (i > 0)
                {
                    sb.Append("\r\n");
                }
                sb.Append(parsedToken);
            }

            return sb.ToString();
        }

        private string ShuffleString(string input)
        {
            var array = input.ToCharArray();
            for (int i = array.Length - 1; i > 0; i--)
            {
                int randomIndex = _random.Next(i + 1);
                var temp = array[i];
                array[i] = array[randomIndex];
                array[randomIndex] = temp;
            }
            return new string(array);
        }
    }
}
