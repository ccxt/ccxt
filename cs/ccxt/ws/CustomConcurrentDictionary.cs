using System.Collections.Concurrent;

namespace ccxt.pro;

public class CustomConcurrentDictionary<TKey, TValue> : ConcurrentDictionary<TKey, TValue>
{

    protected readonly object _syncRoot = new object();


    public CustomConcurrentDictionary()
    {
        // Default constructor, does nothing
    }

    public CustomConcurrentDictionary(IEnumerable<KeyValuePair<TKey, TValue>> initialValues)
    {
        lock (_syncRoot)
        {
            // Console.WriteLine("CustomConcurrentDictionary with initialValues");
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
            // Console.WriteLine("CustomConcurrentDictionary Add");
            this[key] = value;
        }
    }
}