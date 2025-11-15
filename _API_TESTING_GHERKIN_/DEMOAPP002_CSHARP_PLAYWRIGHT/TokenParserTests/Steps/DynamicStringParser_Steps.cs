using System.Text.Json;
using NUnit.Framework.Legacy;
using TechTalk.SpecFlow;
using TokenParserTests.Screenplay;
using TokenParserTests.Screenplay.Questions;
using TokenParserTests.Screenplay.Support;
using TokenParserTests.Screenplay.Tasks;

namespace TokenParserTests.Steps;

[Binding]
public class DynamicStringParser_Steps
{
    private readonly ScenarioContext _scenarioContext;

    public DynamicStringParser_Steps(ScenarioContext scenarioContext)
    {
        _scenarioContext = scenarioContext;
    }

    private Actor Actor => _scenarioContext.GetActor();

    [Given(@"the TokenParser API is available")]
    public void GivenTheDynamicStringAPIIsRunning()
    {
        Console.WriteLine("API available for dynamic string tests.");
    }

    [When(@"a request with dynamic string token '(.*)' is made to the ParseDynamicStringToken endpoint")]
    public async Task WhenARequestWithDynamicStringTokenIsMadeToTheDynamicStringParserEndpoint(string token)
    {
        var query = new Dictionary<string, string>
        {
            { "token", token },
        };

        await Actor.AttemptsTo(SendGetRequest.To("/parse-dynamic-string-token", query));
    }

    [Then(@"the API response should return a status code of (.*) for the ParseDynamicStringToken endpoint")]
    public async Task ThenTheResponseShouldReturnAStatusCodeOfForDynamicToken(int statusCode)
    {
        var actualStatus = await Actor.Answer(ResponseStatus.Code());
        Assert.That((int)actualStatus, Is.EqualTo(statusCode));
    }

    [Then(@"the response should contain ""(.*)"" with the value ""(.*)""")]
    public async Task ThenTheResponseShouldContainWithTheValue(string key, string expectedValue)
    {
        using var json = await Actor.Answer(ResponseJson.Body());
        if (!json.RootElement.TryGetProperty(key, out var actualValue))
        {
            Assert.Fail($"Response does not contain '{key}'.");
        }

        var actualString = actualValue.GetString()?.Trim() ?? string.Empty;
        var actualLength = actualString.Length;

        switch (expectedValue)
        {
            case "An alpha-numeric string of length 5":
                Assert.That(actualLength, Is.EqualTo(5));
                Assert.That(actualString, Does.Match(@"^[A-Za-z0-9]+$"));
                break;

            case "A string of punctuation characters of length 3":
                Assert.That(actualLength, Is.EqualTo(3));
                Assert.That(actualString, Does.Match(@"^[\.\,\!\?\;\:]+$"));
                break;

            case "2 lines of strings with each line containing 10 alpha-numeric-punctuation characters":
                AssertLines(actualString, 2, 10, @"^[A-Za-z0-9\.\,\!\?\;\:]+$");
                break;

            case "A numeric string of length 8":
                Assert.That(actualLength, Is.EqualTo(8));
                Assert.That(actualString, Does.Match(@"^\d+$"));
                break;

            case "3 lines of strings with each line containing 5 special characters":
                AssertLines(actualString, 3, 5, @"^[!@#\$%\^&\*\(\)_\+\[\]\{\}\|;:,\.<>\?]+$");
                break;

            case "A mixed alpha, numeric, and special character string of length 12":
                Assert.That(actualLength, Is.EqualTo(12));
                Assert.That(actualString, Does.Match(@"^[A-Za-z0-9!@#\$%\^&\*\(\)_\+\[\]\{\}\|;:,\.<>\?]+$"));
                break;

            default:
                Assert.That(actualValue.GetString(), Is.EqualTo(expectedValue));
                break;
        }
    }

    private static void AssertLines(string actualString, int expectedLines, int expectedLengthPerLine, string regex)
    {
        var lines = actualString.Split(new[] { "\r\n", "\r", "\n" }, StringSplitOptions.None);
        Assert.That(lines.Length, Is.EqualTo(expectedLines));

        foreach (var line in lines.Where(l => l.Length > 0))
        {
            Assert.That(line.Length, Is.EqualTo(expectedLengthPerLine));
            Assert.That(line, Does.Match(regex));
        }
    }
}
