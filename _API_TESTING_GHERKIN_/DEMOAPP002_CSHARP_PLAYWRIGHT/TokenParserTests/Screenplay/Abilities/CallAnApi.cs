using System.Net.Http.Json;

namespace TokenParserTests.Screenplay.Abilities;

public sealed class CallAnApi : IAbility, IDisposable
{
    private readonly HttpClient _client;

    private CallAnApi(HttpClient client)
    {
        _client = client;
    }

    public static CallAnApi Using(HttpClient client)
    {
        ArgumentNullException.ThrowIfNull(client);
        return new CallAnApi(client);
    }

    public Task<HttpResponseMessage> GetAsync(string requestUri, CancellationToken cancellationToken = default) =>
        _client.GetAsync(requestUri, cancellationToken);

    public Task<HttpResponseMessage> PostAsync<T>(string requestUri, T payload, CancellationToken cancellationToken = default) =>
        _client.PostAsJsonAsync(requestUri, payload, cancellationToken);

    public void Dispose() => _client.Dispose();
}
