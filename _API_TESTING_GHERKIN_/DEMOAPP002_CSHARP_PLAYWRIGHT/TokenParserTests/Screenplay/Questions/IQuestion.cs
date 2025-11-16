namespace TokenParserTests.Screenplay.Questions;

public interface IQuestion<TReturn>
{
    Task<TReturn> AnsweredByAsync(Actor actor, CancellationToken cancellationToken = default);
}
