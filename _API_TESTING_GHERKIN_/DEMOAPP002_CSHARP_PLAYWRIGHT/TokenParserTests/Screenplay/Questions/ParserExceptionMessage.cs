using TokenParserTests.Screenplay.Support;

namespace TokenParserTests.Screenplay.Questions;

public sealed class ParserExceptionMessage : IQuestion<string?>
{
    private ParserExceptionMessage()
    {
    }

    public static ParserExceptionMessage Value() => new();

    public Task<string?> AnsweredByAsync(Actor actor, CancellationToken cancellationToken = default)
    {
        if (actor.TryRecall<Exception>(MemoryKeys.LastParserException, out var exception))
        {
            return Task.FromResult<string?>(exception.Message);
        }

        return Task.FromResult<string?>(null);
    }
}
