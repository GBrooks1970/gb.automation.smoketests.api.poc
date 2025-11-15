using TokenParserTests.Screenplay.Abilities;
using TokenParserTests.Screenplay.Support;

namespace TokenParserTests.Screenplay.Tasks;

public sealed class ParseDateTokenLocally : ITask
{
    private readonly string _token;

    private ParseDateTokenLocally(string token)
    {
        _token = token;
    }

    public static ParseDateTokenLocally From(string token) => new(token);

    public Task PerformAsAsync(Actor actor, CancellationToken cancellationToken = default)
    {
        var ability = actor.AbilityTo<UseTokenParsers>();

        actor.Forget(MemoryKeys.LastParserException);

        try
        {
            var result = ability.ParseDateToken(_token);
            actor.Remember(MemoryKeys.LastParsedDateToken, result);
        }
        catch (Exception ex)
        {
            actor.Remember(MemoryKeys.LastParserException, ex);
            actor.Forget(MemoryKeys.LastParsedDateToken);
        }

        return Task.CompletedTask;
    }
}
