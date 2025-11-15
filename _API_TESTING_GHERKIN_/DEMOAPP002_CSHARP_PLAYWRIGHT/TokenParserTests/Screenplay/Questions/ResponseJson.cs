using System.Text.Json;
using TokenParserTests.Screenplay.Support;

namespace TokenParserTests.Screenplay.Questions;

public sealed class ResponseJson : IQuestion<JsonDocument>
{
    private ResponseJson()
    {
    }

    public static ResponseJson Body() => new();

    public Task<JsonDocument> AnsweredByAsync(Actor actor, CancellationToken cancellationToken = default)
    {
        var content = actor.Recall<string>(MemoryKeys.LastResponseBody);
        var document = JsonDocument.Parse(content);
        return Task.FromResult(document);
    }
}
