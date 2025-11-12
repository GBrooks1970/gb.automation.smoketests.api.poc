using TokenParserAPI.utils;

namespace TokenParserTests.Screenplay.Abilities;

public sealed class UseTokenParsers : IAbility
{
    private readonly ParsedTokenParser _dateParser;
    private readonly TokenDynamicStringParser _stringParser;

    private UseTokenParsers(ParsedTokenParser dateParser, TokenDynamicStringParser stringParser)
    {
        _dateParser = dateParser;
        _stringParser = stringParser;
    }

    public static UseTokenParsers Create() =>
        new(new ParsedTokenParser(), new TokenDynamicStringParser());

    public DateTime ParseDateToken(string token) => _dateParser.ParseToken(token);

    public string ParseDynamicStringToken(string token) => _stringParser.ParseToken(token);
}
