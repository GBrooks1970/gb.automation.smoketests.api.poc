using System.Text.RegularExpressions;

namespace TokenParserAPI.utils
{
    public static class SymbolsDT
    {
        public const string Today = "TODAY";
        public const string Tomorrow = "TOMORROW";
        public const string Yesterday = "YESTERDAY";

        public const string Year = "YEAR";
        public const string Month = "MONTH";
        public const string Day = "DAY";

        // Updated Regular expression to match the new token format
        public const string TokenPattern = @"^\[(?<anchorDate>TODAY|TOMORROW|YESTERDAY)(?<adjustTokens>([+-]\d+(YEAR|MONTH|DAY))*)\]";

        // Regular expression to extract each adjustment token
        public const string AdjustRegexPattern = @"(?<token>(?<sign>[+-])(?<adjustValue>\d+)(?<dateUnit>YEAR|MONTH|DAY))";
    }

    public class ParsedTokenParser
    {
        public DateTime ParseToken(string token)
        {
            Regex regex = new Regex(SymbolsDT.TokenPattern);
            Match match = regex.Match(token);

            if (!match.Success)
            {
                throw new ArgumentException("Invalid string token format");
            }

            // Initialize start date based on the [STARTDATE] token
            DateTime date = match.Groups["anchorDate"].Value switch
            {
                SymbolsDT.Today => DateTime.Today,
                SymbolsDT.Tomorrow => DateTime.Today.AddDays(1),
                SymbolsDT.Yesterday => DateTime.Today.AddDays(-1),
                _ => throw new ArgumentException("Invalid string token format - Invalid anchor date")
            };

            // Extract adjustment tokens and apply them
            string adjustTokens = match.Groups["adjustTokens"].Value;
            ApplyAdjustments(ref date, adjustTokens);

            return date;
        }

        private void ApplyAdjustments(ref DateTime date, string adjustTokens)
        {
            // Updated regex to find individual adjustment tokens
            Regex adjustRegex = new Regex(SymbolsDT.AdjustRegexPattern);
            MatchCollection matches = adjustRegex.Matches(adjustTokens);

            foreach (Match adjustMatch in matches)
            {
                string sign = adjustMatch.Groups["sign"].Value;
                int number = int.Parse(adjustMatch.Groups["adjustValue"].Value);
                string datePart = adjustMatch.Groups["dateUnit"].Value;

                ApplyDatePart(ref date, sign, number, datePart);
            }
        }

        private void ApplyDatePart(ref DateTime date, string sign, int number, string datePart)
        {
            int modifier = sign == "+" ? 1 : -1;
            number *= modifier;

            switch (datePart)
            {
                case SymbolsDT.Year:
                    date = date.AddYears(number);
                    break;
                case SymbolsDT.Month:
                    date = date.AddMonths(number);
                    break;
                case SymbolsDT.Day:
                    date = date.AddDays(number);
                    break;
                default:
                    throw new ArgumentException("Invalid string token format - Invalid date part");
            }
        }
    }


}