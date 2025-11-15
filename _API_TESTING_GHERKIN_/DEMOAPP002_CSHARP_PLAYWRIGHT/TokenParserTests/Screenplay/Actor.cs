using TokenParserTests.Screenplay.Abilities;
using TokenParserTests.Screenplay.Questions;
using TokenParserTests.Screenplay.Tasks;

namespace TokenParserTests.Screenplay;

/// <summary>
/// Minimal Screenplay actor implementation to align the C# stack with the TypeScript projects.
/// </summary>
public sealed class Actor
{
    private readonly Dictionary<Type, IAbility> _abilities = new();
    private readonly Dictionary<string, object> _memory = new(StringComparer.OrdinalIgnoreCase);

    private Actor(string name)
    {
        Name = name;
    }

    public string Name { get; }

    public static Actor Named(string name) => new(name);

    public Actor WhoCan(params IAbility[] abilities)
    {
        foreach (var ability in abilities)
        {
            _abilities[ability.GetType()] = ability;
        }

        return this;
    }

    public T AbilityTo<T>() where T : class, IAbility
    {
        if (_abilities.TryGetValue(typeof(T), out var ability))
        {
            return (T)ability;
        }

        throw new InvalidOperationException($"Actor '{Name}' does not have ability '{typeof(T).Name}'.");
    }

    public void Remember(string key, object value)
    {
        _memory[key] = value;
    }

    public T Recall<T>(string key)
    {
        if (!_memory.TryGetValue(key, out var value))
        {
            throw new InvalidOperationException($"Actor '{Name}' does not remember '{key}'.");
        }

        if (value is not T typed)
        {
            throw new InvalidOperationException($"Actor memory entry '{key}' is of type '{value.GetType().Name}' not '{typeof(T).Name}'.");
        }

        return typed;
    }

    public bool TryRecall<T>(string key, out T value)
    {
        if (_memory.TryGetValue(key, out var stored) && stored is T typed)
        {
            value = typed;
            return true;
        }

        value = default!;
        return false;
    }

    public void Forget(string key)
    {
        _memory.Remove(key);
    }

    public async Task AttemptsTo(params ITask[] tasks)
    {
        foreach (var task in tasks)
        {
            await task.PerformAsAsync(this).ConfigureAwait(false);
        }
    }

    public Task<TReturn> Answer<TReturn>(IQuestion<TReturn> question) =>
        question.AnsweredByAsync(this);
}
