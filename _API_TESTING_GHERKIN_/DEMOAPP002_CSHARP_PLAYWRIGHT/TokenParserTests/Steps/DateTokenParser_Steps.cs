using System.Text.Json;
using NUnit.Framework.Legacy;
using TechTalk.SpecFlow;
using TokenParserAPI.utils;
using TokenParserTests.Screenplay;
using TokenParserTests.Screenplay.Questions;
using TokenParserTests.Screenplay.Support;
using TokenParserTests.Screenplay.Tasks;

namespace TokenParserTests.Steps;

[Binding]
public class DateTokenParser_Steps
{
    private const string TokenKey = "__date-token";

    private readonly ScenarioContext _scenarioContext;

    public DateTokenParser_Steps(ScenarioContext scenarioContext)
    {
        _scenarioContext = scenarioContext;
    }

    private Actor Actor => _scenarioContext.GetActor();

    [Given(@"a valid or invalid date token ""(.*)""")]
    public void GivenAValidOrInvalidDateToken(string token)
    {
        _scenarioContext[TokenKey] = token;
    }

    [When(@"a GET request is made to the ParseDateToken Endpoint")]
    public async Task WhenISendARequestWithTokenToTheParsedTokenAPI()
    {
        var token = GetStoredToken();
        var query = new Dictionary<string, string>
        {
            { "token", token },
        };

        await Actor.AttemptsTo(SendGetRequest.To("/parse-date-token", query));
    }

    [Then(@"the API response for the ParseDateToken Endpoint should return a status code of (.*)")]
    public async Task ThenTheAPIResponseForTheDateTokenParserEndpointShouldReturnAStatusCodeOf(int statusCode)
    {
        var actualStatus = await Actor.Answer(ResponseStatus.Code());
        Assert.That((int)actualStatus, Is.EqualTo(statusCode));
    }

    [Then(@"the response body should contain ""(.*)"" with the value ""(.*)""")]
    public async Task ThenTheResponseBodyShouldContainWithTheValue(string key, string expectedValue)
    {
        using var json = await Actor.Answer(ResponseJson.Body());
        if (!json.RootElement.TryGetProperty(key, out var actualValue))
        {
            Assert.Fail($"Response does not contain '{key}'.");
            return;
        }

        var actualString = actualValue.GetString();
        switch (expectedValue)
        {
            case "today":
                AssertRelativeDate(actualString, 0, 0);
                break;
            case "one year and one month ago from today":
                AssertRelativeDate(actualString, -1, -1);
                break;
            case "one year ahead and two months ago from today":
                AssertRelativeDate(actualString, 1, -2);
                break;
            case "tomorrow plus three days (four days from today)":
                AssertRelativeDate(actualString, 0, 0, 4);
                break;
            case "yesterday minus two days (three days ago)":
                AssertRelativeDate(actualString, 0, 0, -3);
                break;
            case "two years and six months ahead of today minus 15 days":
                AssertRelativeDate(actualString, 2, 6, -15);
                break;
            default:
                Assert.That(actualString, Is.EqualTo(expectedValue));
                break;
        }
    }

    [Then(@"the result should equal today plus (.*) years (.*) months (.*) days")]
    public async Task ThenTheResultShouldEqualTodayPlusYearsMonthsDays(int years, int months, int days)
    {
        using var json = await Actor.Answer(ResponseJson.Body());
        if (!json.RootElement.TryGetProperty("ParsedToken", out var parsedToken))
        {
            Assert.Fail("Response does not contain 'ParsedToken'.");
        }

        var expectedDate = DateTime.Today.AddYears(years).AddMonths(months).AddDays(days);
        var formattedDate = DateFormatting.FormatUtc(expectedDate);

        Assert.That(parsedToken.GetString(), Is.EqualTo(formattedDate));
    }

    private string GetStoredToken()
    {
        if (_scenarioContext.TryGetValue(TokenKey, out var value) && value is string token)
        {
            return token;
        }

        throw new InvalidOperationException("Date token has not been initialised.");
    }

    private static void AssertRelativeDate(string? actualValue, int yearsOffset, int monthsOffset, int daysOffset = 0)
    {
        var expectedDate = DateTime.Today.AddYears(yearsOffset).AddMonths(monthsOffset).AddDays(daysOffset);
        var formattedDate = DateFormatting.FormatUtc(expectedDate);
        Assert.That(actualValue, Is.EqualTo(formattedDate));
    }
}
