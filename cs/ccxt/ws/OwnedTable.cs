#nullable disable
using System;
using System.Collections;
using System.Collections.Generic;

namespace ccxt.pro;

// One config owner thread for the whole process: an options mutation is queued to it, and
// every map publishes a fresh immutable dictionary, so a reader takes that snapshot directly.
// A thread per exchange would mean one live thread per constructed exchange instance.
internal static class ConfigOwner
{
    private static readonly ccxt.WsOwner shared = new ccxt.WsOwner("ccxt-config-owner");

    public static object run(Func<object> work)
    {
        return shared.Ask(work);
    }
}

// A map with one writer: a mutation copies, applies and publishes a new dictionary on the
// owner (the exchange's ws owner when it has one, else the config owner); a read never crosses
// the channel because a published dictionary is never edited again. Member surface is the one
// the concurrent dictionary offered, so generated call sites stay as they are.
public class OwnedTable<TValue> : IDictionary<string, TValue>, IDictionary
{
    private Dictionary<string, TValue> published;
    private readonly ccxt.WsOwner owner;

    public OwnedTable()
    {
        this.published = new Dictionary<string, TValue>();
    }

    public OwnedTable(ccxt.WsOwner value)
    {
        this.owner = value;
        this.published = new Dictionary<string, TValue>();
    }

    public OwnedTable(IDictionary<string, TValue> initial)
    {
        this.published = new Dictionary<string, TValue>(initial);
    }

    private Dictionary<string, TValue> read()
    {
        return this.published;
    }

    private T mutate<T>(Func<Dictionary<string, TValue>, T> work)
    {
        Func<object> op = () =>
        {
            var next = new Dictionary<string, TValue>(this.published);
            var result = work(next);
            this.published = next;
            return (object)result;
        };
        if (this.owner != null)
        {
            return (T)this.owner.Ask(op);
        }
        return (T)ConfigOwner.run(op);
    }

    private void mutateVoid(Action<Dictionary<string, TValue>> work)
    {
        this.mutate<object>(draft =>
        {
            work(draft);
            return null;
        });
    }

    public TValue this[string key]
    {
        get { return this.read()[key]; }
        set
        {
            var value2 = value;
            this.mutateVoid(draft => draft[key] = value2);
        }
    }

    public ICollection<string> Keys
    {
        get { return this.read().Keys; }
    }

    public ICollection<TValue> Values
    {
        get { return this.read().Values; }
    }

    public int Count
    {
        get { return this.read().Count; }
    }

    public bool IsReadOnly
    {
        get { return false; }
    }

    // the previous maps stored over a taken key, and generated callers rely on that
    public void Add(string key, TValue value)
    {
        this[key] = value;
    }

    public bool ContainsKey(string key)
    {
        return this.read().ContainsKey(key);
    }

    public bool Remove(string key)
    {
        return this.mutate(draft => draft.Remove(key));
    }

    public bool TryGetValue(string key, out TValue value)
    {
        return this.read().TryGetValue(key, out value);
    }

    public bool TryAdd(string key, TValue value)
    {
        var value2 = value;
        return this.mutate(draft =>
        {
            if (draft.ContainsKey(key))
            {
                return false;
            }
            draft[key] = value2;
            return true;
        });
    }

    public bool TryRemove(string key, out TValue value)
    {
        TValue found = default(TValue);
        bool removed = this.mutate(draft =>
        {
            TValue current;
            if (!draft.TryGetValue(key, out current))
            {
                return false;
            }
            draft.Remove(key);
            found = current;
            return true;
        });
        value = found;
        return removed;
    }

    // lookup and build are one op on the owner, so a url gets exactly one client
    public TValue GetOrAdd(string key, Func<string, TValue> factory)
    {
        return this.mutate(draft =>
        {
            TValue existing;
            if (draft.TryGetValue(key, out existing))
            {
                return existing;
            }
            var created = factory(key);
            draft[key] = created;
            return created;
        });
    }

    public void Add(KeyValuePair<string, TValue> item)
    {
        this[item.Key] = item.Value;
    }

    public void Clear()
    {
        this.mutateVoid(draft => draft.Clear());
    }

    public bool Contains(KeyValuePair<string, TValue> item)
    {
        return ((ICollection<KeyValuePair<string, TValue>>)this.read()).Contains(item);
    }

    public void CopyTo(KeyValuePair<string, TValue>[] array, int arrayIndex)
    {
        ((ICollection<KeyValuePair<string, TValue>>)this.read()).CopyTo(array, arrayIndex);
    }

    // detach by reference: a reconnect may already have installed a healthy client under the
    // same url, and only the errored instance must leave the table
    public bool Remove(KeyValuePair<string, TValue> item)
    {
        return this.mutate(draft =>
        {
            TValue current;
            if (!draft.TryGetValue(item.Key, out current) || !ReferenceEquals(current, item.Value))
            {
                return false;
            }
            draft.Remove(item.Key);
            return true;
        });
    }

    public IEnumerator<KeyValuePair<string, TValue>> GetEnumerator()
    {
        return this.read().GetEnumerator();
    }

    IEnumerator IEnumerable.GetEnumerator()
    {
        return this.GetEnumerator();
    }

    private Dictionary<string, object> boxed()
    {
        var copy = new Dictionary<string, object>();
        foreach (var entry in this.read())
        {
            copy[entry.Key] = entry.Value;
        }
        return copy;
    }

    bool IDictionary.IsFixedSize
    {
        get { return false; }
    }

    bool ICollection.IsSynchronized
    {
        get { return false; }
    }

    object ICollection.SyncRoot
    {
        get { return this; }
    }

    object IDictionary.this[object key]
    {
        get { return this[(string)key]; }
        set { this[(string)key] = (TValue)value; }
    }

    ICollection IDictionary.Keys
    {
        get { return (ICollection)this.Keys; }
    }

    ICollection IDictionary.Values
    {
        get { return new List<object>(this.boxed().Values); }
    }

    bool IDictionary.Contains(object key)
    {
        return this.ContainsKey((string)key);
    }

    void IDictionary.Add(object key, object value)
    {
        this[(string)key] = (TValue)value;
    }

    void IDictionary.Remove(object key)
    {
        this.Remove((string)key);
    }

    IDictionaryEnumerator IDictionary.GetEnumerator()
    {
        return (IDictionaryEnumerator)new Hashtable(this.boxed()).GetEnumerator();
    }

    void ICollection.CopyTo(Array array, int index)
    {
        new Hashtable(this.boxed()).CopyTo(array, index);
    }
}

// The fetch history ring: appends and drops run on the config owner, readers take a copy, so
// the backing list has exactly one writer. Same members the concurrent queue offered.
public class OwnedHistory<T>
{
    private readonly List<T> state = new List<T>();

    private TOut run<TOut>(Func<TOut> work)
    {
        return (TOut)ConfigOwner.run(() => (object)work());
    }

    public void Enqueue(T item)
    {
        var value = item;
        this.run(() => { this.state.Add(value); return (object)null; });
    }

    public int Count
    {
        get { return this.run(() => this.state.Count); }
    }

    public bool TryDequeue(out T item)
    {
        T found = default(T);
        bool removed = this.run(() =>
        {
            if (this.state.Count == 0)
            {
                return false;
            }
            found = this.state[0];
            this.state.RemoveAt(0);
            return true;
        });
        item = found;
        return removed;
    }

    public List<T> ToList()
    {
        return this.run(() => new List<T>(this.state));
    }
}
