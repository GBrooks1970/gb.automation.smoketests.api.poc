using TokenParserTests.Screenplay.Support;

namespace TokenParserTests.Screenplay.Questions;

public sealed class ParsedDateToken : IQuestion<DateTime?>
{
    private ParsedDateToken()
    {
    }

    public static ParsedDateToken Value() => new();

    public Task<DateTime?> AnsweredByAsync(Actor actor, CancellationToken cancellationToken = default)
    {
        if (actor.TryRecall<DateTime>(MemoryKeys.LastParsedDateToken, out var value))
        {
            return Task.FromResult<DateTime?>(value);
        }

        return Task.FromResult<DateTime?>(null);
    }
}
