using System.Net;
using TokenParserTests.Screenplay.Support;

namespace TokenParserTests.Screenplay.Questions;

public sealed class ResponseStatus : IQuestion<HttpStatusCode>
{
    private ResponseStatus()
    {
    }

    public static ResponseStatus Code() => new();

    public Task<HttpStatusCode> AnsweredByAsync(Actor actor, CancellationToken cancellationToken = default)
    {
        var status = actor.Recall<HttpStatusCode>(MemoryKeys.LastResponseStatus);
        return Task.FromResult(status);
    }
}
