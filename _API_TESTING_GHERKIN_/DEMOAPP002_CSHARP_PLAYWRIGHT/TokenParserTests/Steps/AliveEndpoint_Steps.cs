using NUnit.Framework.Legacy;
using TechTalk.SpecFlow;
using TokenParserTests.Screenplay;
using TokenParserTests.Screenplay.Questions;
using TokenParserTests.Screenplay.Support;
using TokenParserTests.Screenplay.Tasks;

namespace TokenParserTests.Steps;

[Binding]
public class AliveEndpoint_Steps
{
    private readonly ScenarioContext _scenarioContext;

    public AliveEndpoint_Steps(ScenarioContext scenarioContext)
    {
        _scenarioContext = scenarioContext;
    }

    private Actor Actor => _scenarioContext.GetActor();

    [Given(@"the API is available")]
    public void GiventheAPIIsAvailable()
    {
        // Kept for readability / parity with other stacks
        Console.WriteLine("Given the API is available");
    }

    [When(@"a GET request is made to the Alive Endpoint")]
    public async Task WhenISendAGETRequestTo()
    {
        await Actor.AttemptsTo(SendGetRequest.To("/alive"));
    }

    [Then(@"the API response should return a status code of (.*)")]
    public async Task ThenTheResponseShouldReturnAStatusCodeOf(int statusCode)
    {
        var actualStatus = await Actor.Answer(ResponseStatus.Code());
        Assert.That((int)actualStatus, Is.EqualTo(statusCode));
    }

    [Then(@"the Alive Endpoint response body should contain ""(.*)"" with the value ""(.*)""")]
    public async Task ThenTheResponseShouldContainTheMessage(string propertyName, string expectedString)
    {
        using var json = await Actor.Answer(ResponseJson.Body());
        if (!json.RootElement.TryGetProperty(propertyName, out var actual))
        {
            Assert.Fail($"Response body does not contain '{propertyName}'.");
        }

        Assert.That(actual.GetString(), Is.EqualTo(expectedString),
            $"Expected string: {expectedString}, but got: {actual.GetString()}");
    }
}
