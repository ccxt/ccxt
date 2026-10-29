namespace ccxt.pro;

using System;
using System.Collections;
using System.Collections.Generic;

// The public face of one ws cache map. Every member ships its work to the exchange's
// ws owner (ccxt.WsOwner), so the backing dictionary is only ever touched by that one
// thread; a caller already on the owner runs inline. Unbound (before the exchange opens
// its first ws client) every member runs inline on the caller.
public sealed class OwnedMap : IDictionary<string, object>, IDictionary
{
    private Dictionary<string, object> state;
    private ccxt.WsOwner owner;

    public OwnedMap() : this((IDictionary<string, object>)null)
    {
    }

    // Copies the assigned map: this facade holds the only reference to the backing store,
    // so no caller can keep writing it outside the owner.
    public OwnedMap(IDictionary<string, object> initial)
    {
        this.state = initial == null ? new Dictionary<string, object>() : new Dictionary<string, object>(initial);
    }

    /// Hand the exchange owner over; called before the first ws client exists.
    public void bind(ccxt.WsOwner value)
    {
        if (value != null)
        {
            this.owner = value;
        }
    }

    private T run<T>(Func<T> work)
    {
        if (this.owner == null)
        {
            return work();
        }
        return (T)this.owner.Ask(() => (object)work());
    }

    public object this[string key]
    {
        get { return this.run(() => this.state[key]); }
        set { this.run(() => { this.state[key] = value; return (object)null; }); }
    }

    public ICollection<string> Keys
    {
        get { return this.run(() => (ICollection<string>)new List<string>(this.state.Keys)); }
    }

    public ICollection<object> Values
    {
        get { return this.run(() => (ICollection<object>)new List<object>(this.state.Values)); }
    }

    public int Count
    {
        get { return this.run(() => this.state.Count); }
    }

    public bool IsReadOnly
    {
        get { return false; }
    }

    // the previous map type was a concurrent dictionary whose Add stored over the key,
    // so generated callers rely on Add not throwing on a taken key
    public void Add(string key, object value)
    {
        this.run(() => { this.state[key] = value; return (object)null; });
    }

    public bool ContainsKey(string key)
    {
        return this.run(() => this.state.ContainsKey(key));
    }

    public bool Remove(string key)
    {
        return this.run(() => this.state.Remove(key));
    }

    public bool TryGetValue(string key, out object value)
    {
        var outcome = this.run(() => this.state.TryGetValue(key, out object found) ? new object[] { true, found } : new object[] { false, null });
        value = (bool)outcome[0] ? outcome[1] : null;
        return (bool)outcome[0];
    }

    public void Add(KeyValuePair<string, object> item)
    {
        this.run(() => { this.state[item.Key] = item.Value; return (object)null; });
    }

    public void Clear()
    {
        this.run(() => { this.state.Clear(); return (object)null; });
    }

    public bool Contains(KeyValuePair<string, object> item)
    {
        return this.run(() => ((ICollection<KeyValuePair<string, object>>)this.state).Contains(item));
    }

    public void CopyTo(KeyValuePair<string, object>[] array, int arrayIndex)
    {
        this.run(() => { ((ICollection<KeyValuePair<string, object>>)this.state).CopyTo(array, arrayIndex); return (object)null; });
    }

    public bool Remove(KeyValuePair<string, object> item)
    {
        return this.run(() => ((ICollection<KeyValuePair<string, object>>)this.state).Remove(item));
    }

    // a snapshot, so an enumeration never holds the owner across caller code
    public IEnumerator<KeyValuePair<string, object>> GetEnumerator()
    {
        return this.run(() => (IEnumerator<KeyValuePair<string, object>>)new List<KeyValuePair<string, object>>(this.state).GetEnumerator());
    }

    IEnumerator IEnumerable.GetEnumerator()
    {
        return this.GetEnumerator();
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
        set { this[(string)key] = value; }
    }

    ICollection IDictionary.Keys
    {
        get { return (ICollection)this.Keys; }
    }

    ICollection IDictionary.Values
    {
        get { return (ICollection)this.Values; }
    }

    bool IDictionary.Contains(object key)
    {
        return this.ContainsKey((string)key);
    }

    void IDictionary.Add(object key, object value)
    {
        this[(string)key] = value;
    }

    void IDictionary.Remove(object key)
    {
        this.Remove((string)key);
    }

    IDictionaryEnumerator IDictionary.GetEnumerator()
    {
        return (IDictionaryEnumerator)this.run(() => (object)new Hashtable(this.state).GetEnumerator());
    }

    void ICollection.CopyTo(Array array, int index)
    {
        this.run(() => { ((ICollection)new Hashtable(this.state)).CopyTo(array, index); return (object)null; });
    }
}
