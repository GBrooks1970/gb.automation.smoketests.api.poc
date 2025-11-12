namespace TokenParserTests.Screenplay.Tasks;

public interface ITask
{
    Task PerformAsAsync(Actor actor, CancellationToken cancellationToken = default);
}
