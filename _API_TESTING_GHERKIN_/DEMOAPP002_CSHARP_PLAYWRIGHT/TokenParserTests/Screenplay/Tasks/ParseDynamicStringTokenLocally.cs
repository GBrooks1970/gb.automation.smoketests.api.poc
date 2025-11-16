using TokenParserTests.Screenplay.Abilities;
using TokenParserTests.Screenplay.Support;

namespace TokenParserTests.Screenplay.Tasks;

public sealed class ParseDynamicStringTokenLocally : ITask
{
    private readonly string _token;

    private ParseDynamicStringTokenLocally(string token)
    {
        _token = token;
    }

    public static ParseDynamicStringTokenLocally From(string token) => new(token);

    public Task PerformAsAsync(Actor actor, CancellationToken cancellationToken = default)
    {
        var ability = actor.AbilityTo<UseTokenParsers>();

        actor.Forget(MemoryKeys.LastParserException);

        try
        {
            var result = ability.ParseDynamicStringToken(_token);
            actor.Remember(MemoryKeys.LastParsedStringToken, result);
        }
        catch (Exception ex)
        {
            actor.Remember(MemoryKeys.LastParserException, ex);
            actor.Forget(MemoryKeys.LastParsedStringToken);
        }

        return Task.CompletedTask;
    }
}
