using System.Text;
using System.Text.RegularExpressions;

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
        private static Random _random = new Random();

        public string ParseToken(string token)
        {
            var regex = new Regex(SymbolsDS.TokenPattern);
            var match = regex.Match(token);

            if (!match.Success)
                throw new ArgumentException("Invalid string token format");

            string types = match.Groups["types"].Value;
            string lengthValue = match.Groups["length"].Value;
            int lineCount = match.Groups["lines"].Success ? int.Parse(match.Groups["lines"].Value) : 1;

            bool useAllCharacters = lengthValue == SymbolsDS.ALL;
            int count = useAllCharacters ? 0 : int.Parse(lengthValue); // If ALL, count will be handled later.

            string ParsedToken = GenerateString(types, count, useAllCharacters);
            return GenerateLines(ParsedToken, lineCount);
        }

        private string GenerateString(string types, int count, bool useAllCharacters)
        {
            var charPool = new StringBuilder();

            // Build the pool of possible characters based on the token types
            if (types.Contains(SymbolsDS.ALPHA))
                charPool.Append(GetCharRange('A', 'Z'));  // Add A-Z to the pool
            if (types.Contains(SymbolsDS.NUMERIC))
                charPool.Append(GetCharRange('0', '9'));  // Add 0-9 to the pool
            if (types.Contains(SymbolsDS.PUNCTUATION))
                charPool.Append("!@#$%^&*()");  // Add punctuation characters to the pool
            if (types.Contains(SymbolsDS.SPECIAL))
                charPool.Append("~`|\\/?");  // Add special characters to the pool

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
            var result = new StringBuilder();
            for (int i = 0; i < count; i++)
            {
                int randomIndex = _random.Next(charPool.Length);
                result.Append(charPool[randomIndex]);
            }
            return result.ToString();
        }

        private string GetCharRange(char start, char end)
        {
            var sb = new StringBuilder();
            for (char c = start; c <= end; c++)
            {
                sb.Append(c);
            }
            return sb.ToString();
        }

        private string GenerateLines(string ParsedToken, int lineCount)
        {
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < lineCount; i++)
            {
                sb.AppendLine(ParsedToken);
            }
            return sb.ToString();
        }

        private char GetRandomChar(char min, char max) => (char)_random.Next(min, max + 1);

        private char GetRandomPunctuation()
        {
            const string punctuation = "!@#$%^&*()";
            return punctuation[_random.Next(punctuation.Length)];
        }

        private char GetRandomSpecialChar()
        {
            const string special = "~`|\\/?";
            return special[_random.Next(special.Length)];
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