using TechTalk.SpecFlow;
using TokenParserTests.Screenplay.Abilities;

namespace TokenParserTests.Screenplay.Support;

[Binding]
public sealed class ScreenplayHooks : IDisposable
{
    private readonly ScenarioContext _scenarioContext;
    private CallAnApi? _apiAbility;

    public ScreenplayHooks(ScenarioContext scenarioContext)
    {
        _scenarioContext = scenarioContext;
    }

    [BeforeScenario(Order = -100)]
    public void ConfigureActor()
    {
        var baseAddress = ScreenplayConfiguration.ResolveApiBaseAddress();
        var httpClient = new HttpClient
        {
            BaseAddress = baseAddress,
        };

        _apiAbility = CallAnApi.Using(httpClient);
        var parserAbility = UseTokenParsers.Create();

        var actor = Actor.Named("SpecFlow API Actor")
            .WhoCan(_apiAbility, parserAbility);

        _scenarioContext.SetActor(actor);
    }

    [AfterScenario(Order = 100)]
    public void Cleanup()
    {
        _apiAbility?.Dispose();
        _apiAbility = null;
    }

    public void Dispose()
    {
        Cleanup();
    }
}
