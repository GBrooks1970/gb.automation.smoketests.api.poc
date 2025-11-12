using System.Web;
using TokenParserTests.Screenplay.Abilities;
using TokenParserTests.Screenplay.Support;

namespace TokenParserTests.Screenplay.Tasks;

public sealed class SendGetRequest : ITask
{
    private readonly string _endpoint;
    private readonly IReadOnlyDictionary<string, string>? _query;

    private SendGetRequest(string endpoint, IReadOnlyDictionary<string, string>? query)
    {
        _endpoint = endpoint;
        _query = query;
    }

    public static SendGetRequest To(string endpoint, IReadOnlyDictionary<string, string>? query = null) =>
        new(endpoint, query);

    public async Task PerformAsAsync(Actor actor, CancellationToken cancellationToken = default)
    {
        var callAnApi = actor.AbilityTo<CallAnApi>();

        var requestUri = BuildUri(_endpoint, _query);
        var response = await callAnApi.GetAsync(requestUri, cancellationToken).ConfigureAwait(false);
        var body = await response.Content.ReadAsStringAsync(cancellationToken).ConfigureAwait(false);

        actor.Remember(MemoryKeys.LastResponseStatus, response.StatusCode);
        actor.Remember(MemoryKeys.LastResponseBody, body);
    }

    private static string BuildUri(string endpoint, IReadOnlyDictionary<string, string>? query)
    {
        if (query == null || query.Count == 0)
        {
            return endpoint;
        }

        var builder = HttpUtility.ParseQueryString(string.Empty);
        foreach (var kvp in query)
        {
            builder[kvp.Key] = kvp.Value;
        }

        return $"{endpoint}?{builder}";
    }
}
