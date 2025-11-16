using TokenParserTests.Screenplay.Support;

namespace TokenParserTests.Screenplay.Questions;

public sealed class ParsedStringToken : IQuestion<string?>
{
    private ParsedStringToken()
    {
    }

    public static ParsedStringToken Value() => new();

    public Task<string?> AnsweredByAsync(Actor actor, CancellationToken cancellationToken = default)
    {
        if (actor.TryRecall<string>(MemoryKeys.LastParsedStringToken, out var value))
        {
            return Task.FromResult<string?>(value);
        }

        return Task.FromResult<string?>(null);
    }
}
