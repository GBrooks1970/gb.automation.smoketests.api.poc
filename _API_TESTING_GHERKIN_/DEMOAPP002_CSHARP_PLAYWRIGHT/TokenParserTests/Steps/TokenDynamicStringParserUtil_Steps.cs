using System;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using NUnit.Framework;
using TechTalk.SpecFlow;
using TokenParserTests.Screenplay;
using TokenParserTests.Screenplay.Questions;
using TokenParserTests.Screenplay.Support;
using TokenParserTests.Screenplay.Tasks;

namespace TokenParserTests.Steps;

[Binding]
public class TokenDynamicStringParserUtil_Steps
{
    private const string TokenKey = "__util-dynamic-token";
    private readonly ScenarioContext _scenarioContext;

    public TokenDynamicStringParserUtil_Steps(ScenarioContext scenarioContext)
    {
        _scenarioContext = scenarioContext;
    }

    private Actor Actor => _scenarioContext.GetActor();

    [Given(@"a token ""(.*)""")]
    public void GivenAToken(string token)
    {
        _scenarioContext[TokenKey] = token;
    }

    [When(@"I parse and generate the string")]
    public async Task WhenIParseAndGenerateTheString()
    {
        var token = GetStoredToken();
        await Actor.AttemptsTo(ParseDynamicStringTokenLocally.From(token));
    }

    [Then(@"the generated string should have a length of (.*)")]
    public async Task ThenTheGeneratedStringShouldHaveALengthOf(int expectedLength)
    {
        var generated = await EnsureSuccess();
        var sanitized = generated.Replace("\r\n", string.Empty, StringComparison.Ordinal);
        Assert.That(sanitized.Length, Is.EqualTo(expectedLength));
    }

    [Then(@"the generated string should match the character set ""(.*)""")]
    public async Task ThenTheGeneratedStringShouldMatchTheCharacterSet(string characterSet)
    {
        var generated = await EnsureSuccess();
        var regexPattern = characterSet switch
        {
            "ALPHA" => @"^[A-Za-z\r\n]+$",
            "NUMERIC" => @"^[0-9\r\n]+$",
            "ALPHA_NUMERIC" => @"^[A-Za-z0-9\r\n]+$",
            "ALPHA_NUMERIC_PUNCTUATION" => @"^[A-Za-z0-9\.\,\!\?\;\:\r\n]+$",
            "SPECIAL" => @"^[\!\@\#\$\%\^\&\*\(\)_\+\[\]\{\}\|\;\:\,\.\<\>\?\r\n]+$",
            "ALPHA_PUNCTUATION" => @"^[A-Za-z\.\,\!\?\;\:\r\n]+$",
            "PUNCTUATION" => @"^[\.\,\!\?\;\:\r\n]+$",
            "SPECIAL_PUNCTUATION" => @"^[\!\@\#\$\%\^\&\*\(\)_\+\[\]\{\}\|\;\:\,\.\<\>\?\.\,\!\?\;\:\r\n]+$",
            "ALPHA_NUMERIC_SPECIAL" => @"^[A-Za-z0-9\!\@\#\$\%\^\&\*\(\)_\+\[\]\{\}\|\;\:\,\.\<\>\?\r\n]+$",
            _ => throw new ArgumentException($"Unknown character set '{characterSet}'"),
        };

        Assert.That(Regex.IsMatch(generated, regexPattern), $"Generated string '{generated}' does not match character set {characterSet}");
    }

    [Then(@"the generated string should have (.*) lines")]
    public async Task ThenTheGeneratedStringShouldHaveLines(int expectedLines)
    {
        var generated = await EnsureSuccess();
        var lines = generated.Split(new[] { "\r\n" }, StringSplitOptions.None);
        Assert.That(lines.Length, Is.EqualTo(expectedLines));
    }

    [Then(@"a dynamic string parser error should be thrown with message ""(.*)""")]
    public async Task ThenADynamicStringParserErrorShouldBeThrownWithMessage(string expectedMessage)
    {
        var message = await Actor.Answer(ParserExceptionMessage.Value());
        Assert.That(message, Is.Not.Null, "Expected parsing to throw an exception.");
        Assert.That(message, Does.Contain(expectedMessage));
    }

    private async Task<string> EnsureSuccess()
    {
        var message = await Actor.Answer(ParserExceptionMessage.Value());
        Assert.That(message, Is.Null, () => $"Unexpected exception: {message}");

        var generated = await Actor.Answer(ParsedStringToken.Value());
        Assert.That(generated, Is.Not.Null, "Parser did not return a string.");
        return generated!;
    }

    private string GetStoredToken()
    {
        if (_scenarioContext.TryGetValue(TokenKey, out var value) && value is string token)
        {
            return token;
        }

        throw new InvalidOperationException("Dynamic parser token has not been initialised.");
    }
}
