using System;
using System.Collections.Generic;
using System.Globalization;

namespace TokenParserAPI.Logging
{
    public enum TokenParserLogLevel
    {
        Silent = 0,
        Error = 1,
        Warn = 2,
        Info = 3,
        Debug = 4
    }

    public sealed class TokenParserLogger
    {
        private static readonly Dictionary<TokenParserLogLevel, int> LevelOrder = new()
        {
            { TokenParserLogLevel.Silent, 0 },
            { TokenParserLogLevel.Error, 1 },
            { TokenParserLogLevel.Warn, 2 },
            { TokenParserLogLevel.Info, 3 },
            { TokenParserLogLevel.Debug, 4 },
        };

        private static TokenParserLogLevel _globalLevel = TokenParserLogLevel.Debug;

        private readonly string _category;

        private TokenParserLogger(string category)
        {
            _category = category;
        }

        public static void Configure(TokenParserLogLevel level)
        {
            _globalLevel = level;
        }

        public static TokenParserLogLevel ParseLevel(string? level)
        {
            if (string.IsNullOrWhiteSpace(level))
            {
                return TokenParserLogLevel.Debug;
            }

            return Enum.TryParse<TokenParserLogLevel>(level, ignoreCase: true, out var parsed)
                ? parsed
                : TokenParserLogLevel.Debug;
        }

        public static TokenParserLogger For(string category) => new(category);

        public void Debug(string message, params object[] args) =>
            Write(TokenParserLogLevel.Debug, message, args);

        public void Info(string message, params object[] args) =>
            Write(TokenParserLogLevel.Info, message, args);

        public void Warn(string message, params object[] args) =>
            Write(TokenParserLogLevel.Warn, message, args);

        public void Error(string message, params object[] args) =>
            Write(TokenParserLogLevel.Error, message, args);

        private static bool ShouldLog(TokenParserLogLevel level) =>
            _globalLevel != TokenParserLogLevel.Silent &&
            LevelOrder[level] <= LevelOrder[_globalLevel];

        private void Write(TokenParserLogLevel level, string message, params object[] args)
        {
            if (!ShouldLog(level))
            {
                return;
            }

            var prefix = $"[{level}] [{_category}]";
            var formatted = args is { Length: > 0 }
                ? string.Format(CultureInfo.InvariantCulture, message, args)
                : message;

            if (level == TokenParserLogLevel.Error)
            {
                Console.Error.WriteLine($"{prefix} {formatted}");
            }
            else
            {
                Console.WriteLine($"{prefix} {formatted}");
            }
        }
    }
}
