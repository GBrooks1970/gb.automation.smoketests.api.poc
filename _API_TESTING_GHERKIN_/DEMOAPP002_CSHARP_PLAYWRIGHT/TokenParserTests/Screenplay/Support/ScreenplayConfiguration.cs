namespace TokenParserTests.Screenplay.Support;

public static class ScreenplayConfiguration
{
    private const string ApiBaseUrlVariable = "API_BASE_URL";
    private const string DefaultBaseUrl = "http://localhost:5228";

    public static Uri ResolveApiBaseAddress()
    {
        var configured = Environment.GetEnvironmentVariable(ApiBaseUrlVariable);
        var value = string.IsNullOrWhiteSpace(configured) ? DefaultBaseUrl : configured;
        return new Uri(value, UriKind.Absolute);
    }
}
