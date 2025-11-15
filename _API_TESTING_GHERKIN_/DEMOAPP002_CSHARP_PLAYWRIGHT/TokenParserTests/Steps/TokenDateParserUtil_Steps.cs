using System;
using System.Threading.Tasks;
using NUnit.Framework;
using TechTalk.SpecFlow;
using TokenParserTests.Screenplay;
using TokenParserTests.Screenplay.Questions;
using TokenParserTests.Screenplay.Support;
using TokenParserTests.Screenplay.Tasks;

namespace TokenParserTests.Steps;

[Binding]
public class TokenDateParserUtil_Steps
{
    private const string TokenKey = "__util-date-token";
    private readonly ScenarioContext _scenarioContext;

    public TokenDateParserUtil_Steps(ScenarioContext scenarioContext)
    {
        _scenarioContext = scenarioContext;
    }

    private Actor Actor => _scenarioContext.GetActor();

    [Given(@"A date token ""(.*)""")]
    public void GivenADateToken(string token)
    {
        _scenarioContext[TokenKey] = token;
    }

    [Given(@"An invalid date range string ""(.*)""")]
    public void GivenAnInvalidDateRangeString(string token)
    {
        _scenarioContext[TokenKey] = token;
    }

    [When(@"I parse the token")]
    public async Task WhenIParseTheToken()
    {
        var token = GetStoredToken();
        await Actor.AttemptsTo(ParseDateTokenLocally.From(token));
    }

    [Then(@"the result should be today's date")]
    public async Task ThenTheResultShouldBeTodaySDate()
    {
        await AssertRelativeDate(() => DateTime.Today);
    }

    [Then(@"the result should be tomorrow's date")]
    public async Task ThenTheResultShouldBeTomorrowSDate()
    {
        await AssertRelativeDate(() => DateTime.Today.AddDays(1));
    }

    [Then(@"the result should be yesterday's date")]
    public async Task ThenTheResultShouldBeYesterdaySDate()
    {
        await AssertRelativeDate(() => DateTime.Today.AddDays(-1));
    }

    [Then(@"the result should be today's date minus two year and four month")]
    public async Task ThenTheResultShouldBeTodayMinusTwoYearsAndFourMonths()
    {
        await AssertRelativeDate(() => DateTime.Today.AddYears(-2).AddMonths(-4));
    }

    [Then(@"the result should be today's date minus one year and one month")]
    public async Task ThenTheResultShouldBeTodayMinusOneYearAndOneMonth()
    {
        await AssertRelativeDate(() => DateTime.Today.AddYears(-1).AddMonths(-1));
    }

    [Then(@"the result should be today's date minus one year, two months, and three days")]
    public async Task ThenTheResultShouldBeTodayMinusOneYearTwoMonthsAndThreeDays()
    {
        await AssertRelativeDate(() => DateTime.Today.AddYears(-1).AddMonths(-2).AddDays(-3));
    }

    [Then(@"the result should be today's date plus one year, minus one month, and plus one day")]
    public async Task ThenTheResultShouldBeTodayPlusOneYearMinusOneMonthPlusOneDay()
    {
        await AssertRelativeDate(() => DateTime.Today.AddYears(1).AddMonths(-1).AddDays(1));
    }

    [Then(@"the result should be today's date plus two years")]
    public async Task ThenTheResultShouldBeTodayPlusTwoYears()
    {
        await AssertRelativeDate(() => DateTime.Today.AddYears(2));
    }

    [Then(@"the result should be today's date plus five months")]
    public async Task ThenTheResultShouldBeTodayPlusFiveMonths()
    {
        await AssertRelativeDate(() => DateTime.Today.AddMonths(5));
    }

    [Then(@"the result should be tomorrow's date plus five months")]
    public async Task ThenTheResultShouldBeTomorrowPlusFiveMonths()
    {
        await AssertRelativeDate(() => DateTime.Today.AddDays(1).AddMonths(5));
    }

    [Then(@"the result should be yesterday's date plus five months and minus one year")]
    public async Task ThenTheResultShouldBeYesterdayPlusFiveMonthsMinusOneYear()
    {
        await AssertRelativeDate(() => DateTime.Today.AddDays(-1).AddMonths(5).AddYears(-1));
    }

    [Then(@"the result should equal today plus (.*) years (.*) months (.*) days")]
    [Scope(Tag = "utiltests")]
    public async Task ThenTheResultShouldEqualOffsets(int years, int months, int days)
    {
        await AssertRelativeDate(() => DateTime.Today.AddYears(years).AddMonths(months).AddDays(days));
    }

    [Then(@"an error should be thrown with message ""(.*)""")]
    public async Task ThenAnErrorShouldBeThrownWithMessage(string expectedMessage)
    {
        var message = await Actor.Answer(ParserExceptionMessage.Value());
        Assert.That(message, Is.Not.Null, "Expected parsing to throw an exception.");
        Assert.That(message, Does.Contain(expectedMessage));
    }

    private async Task AssertRelativeDate(Func<DateTime> expectedFactory)
    {
        var message = await Actor.Answer(ParserExceptionMessage.Value());
        Assert.That(message, Is.Null, () => $"Unexpected exception: {message}");

        var result = await Actor.Answer(ParsedDateToken.Value());
        Assert.That(result, Is.Not.Null, "Parsing did not produce a result.");

        var expected = expectedFactory().Date;
        Assert.That(result!.Value.Date, Is.EqualTo(expected));
    }

    private string GetStoredToken()
    {
        if (_scenarioContext.TryGetValue(TokenKey, out var value) && value is string token)
        {
            return token;
        }

        throw new InvalidOperationException("Parser token has not been initialised.");
    }
}
