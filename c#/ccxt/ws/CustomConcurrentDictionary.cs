using System.Collections.Concurrent;

namespace ccxt;

public class CustomConcurrentDictionary<TKey, TValue> : ConcurrentDictionary<TKey, TValue>
{

    private readonly object _syncRoot = new object();


    public CustomConcurrentDictionary()
    {
        // Default constructor, does nothing
    }

    public CustomConcurrentDictionary(IEnumerable<KeyValuePair<TKey, TValue>> initialValues)
    {
        lock (_syncRoot)
        {
            foreach (var kvp in initialValues)
            {
                this[kvp.Key] = kvp.Value;
            }
        }

    }

    public void Add(TKey key, TValue value)
    {
        lock (_syncRoot)
        {
            this[key] = value;
        }
    }
}