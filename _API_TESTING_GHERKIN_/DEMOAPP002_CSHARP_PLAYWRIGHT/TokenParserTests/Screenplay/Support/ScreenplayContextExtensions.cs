using TechTalk.SpecFlow;

namespace TokenParserTests.Screenplay.Support;

public static class ScreenplayContextExtensions
{
    private const string ActorKey = "__screenplay_actor";

    public static void SetActor(this ScenarioContext context, Actor actor)
    {
        context[ActorKey] = actor;
    }

    public static Actor GetActor(this ScenarioContext context)
    {
        if (context.TryGetValue(ActorKey, out Actor? actor) && actor is not null)
        {
            return actor;
        }

        throw new InvalidOperationException("Screenplay actor has not been initialised for this scenario.");
    }
}
