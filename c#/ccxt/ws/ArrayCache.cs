using System.Globalization;
using System.Net;
using System.Collections.Generic;
using Newtonsoft.Json;
using System.Collections.Concurrent;
using System.Collections;

namespace ccxt;

using dict = Dictionary<string, object>;

public class ConcurrentList<T> : IList<T>
{
    private readonly IList<T> _list = new List<T>();
    private readonly object _syncRoot = new object();

    public int Count => _list.Count;

    public bool IsReadOnly => _list.IsReadOnly;

    public void Add(T item)
    {
        lock (_syncRoot)
        {
            _list.Add(item);
        }
    }

    public bool Remove(T item)
    {
        lock (_syncRoot)
        {
            return _list.Remove(item);
        }
    }
    public void RemoveAt(int index)
    {
        lock (_syncRoot)
        {
            _list.RemoveAt(index);
        }
    }

    public T this[int index]
    {
        get
        {
            lock (_syncRoot)
            {
                return _list[index];
            }
        }
        set
        {
            lock (_syncRoot)
            {
                _list[index] = value;
            }
        }
    }

    IEnumerator<T> IEnumerable<T>.GetEnumerator()
    {
        return GetEnumeratorTraditional();
    }
    public IEnumerator<T> GetEnumeratorTraditional()
    {
        lock (_syncRoot)
        {
            return _list.ToList().GetEnumerator();
        }
    }

    public void Clear()
    {
        lock (_syncRoot)
        {
            _list.Clear();
        }
    }
    public bool Contains(T item)
    {
        lock (_syncRoot)
        {
            return _list.Contains(item);
        }
    }

    public void AddRange(IEnumerable<T> items)
    {
        lock (_syncRoot)
        {
            foreach (var item in items)
            {
                _list.Add(item);
            }
        }
    }
    public void RemoveAll(Predicate<T> match)
    {
        lock (_syncRoot)
        {
            // _list.RemoveAll(match);
        }
    }

    public IList<T> GetSnapshot()
    {
        lock (_syncRoot)
        {
            return _list.ToList();
        }
    }

    public int IndexOf(T item)
    {
        // throw new NotImplementedException();
        lock (_syncRoot)
        {
            return _list.IndexOf(item);
        }
    }

    public void Insert(int index, T item)
    {
        // throw new NotImplementedException();
        lock (_syncRoot)
        {
            _list.Insert(index, item);
        }
    }

    public void CopyTo(T[] array, int arrayIndex)
    {
        // throw new NotImplementedException();
        lock (_syncRoot)
        {
            _list.CopyTo(array, arrayIndex);
        }
    }

    public IEnumerator GetEnumerator()
    {
        // throw new NotImplementedException();
        lock (_syncRoot)
        {
            return _list.GetEnumerator();
        }
    }

    public object Find(Predicate<object> match)
    {
        if (match == null)
            throw new ArgumentNullException(nameof(match));

        foreach (var item in this)
        {
            if (match(item))
                return item;
        }

        return default(T); // Element not found
    }
    // Continue implementing the rest of the IList<T> interface...
}


// public class CustomConcurrentBag<T> : ConcurrentBag<T>
// {
//     // Add an item to the custom bag
//     public void AddItem(T item)
//     {
//         base.Add(item);
//     }

//     public void Clear()
//     {
//         while (TryTake(out _)) { } // Remove all items from the bag
//     }

//     // Access an item by index
//     public T this[int index]
//     {
//         get
//         {
//             if (index < 0 || index >= Count)
//                 throw new ArgumentOutOfRangeException(nameof(index));

//             return this.ElementAt(index);
//         }
//         set
//         {
//             if (index < 0 || index >= Count)
//                 throw new ArgumentOutOfRangeException(nameof(index));

//             T existingItem = this.ElementAt(index);
//             if (!EqualityComparer<T>.Default.Equals(existingItem, value))
//             {
//                 // Remove the existing item and add the new one
//                 bool removed = TryTake(out existingItem);
//                 if (removed)
//                     Add(value);
//                 else
//                     throw new InvalidOperationException("Failed to set the item.");
//             }
//         }
//     }


//     // Indexer setter
//     public void SetItem(int index, T value)
//     {
//         if (index < 0 || index >= Count)
//             throw new ArgumentOutOfRangeException(nameof(index));

//         T existingItem = this.ElementAt(index);
//         if (!EqualityComparer<T>.Default.Equals(existingItem, value))
//         {
//             // Remove the existing item and add the new one
//             bool removed = TryTake(out existingItem);
//             if (removed)
//                 Add(value);
//             else
//                 throw new InvalidOperationException("Failed to set the item.");
//         }
//     }

//     public T Find(Predicate<T> match)
//     {
//         if (match == null)
//             throw new ArgumentNullException(nameof(match));

//         foreach (var item in this)
//         {
//             if (match(item))
//                 return item;
//         }

//         return default(T); // Element not found
//     }

//     // Find the index of an item in the custom bag
//     public int IndexOf(T item)
//     {
//         int index = 0;
//         foreach (var currentItem in this)
//         {
//             if (EqualityComparer<T>.Default.Equals(currentItem, item))
//                 return index;
//             index++;
//         }
//         return -1; // Item not found
//     }

//     // Remove an item at a specific index
//     public void RemoveAt(int index)
//     {
//         if (index < 0 || index >= Count)
//             throw new ArgumentOutOfRangeException(nameof(index));

//         T itemToRemove = this.ElementAt(index);
//         base.TryTake(out itemToRemove); // TryTake removes the item
//     }
// }

// public class ThreadSafeList<T> : IList<T>
// {
//     protected List<T> _internalList = new List<T>();

//     // Other Elements of IList implementation

//     public IEnumerator<T> GetEnumerator()
//     {
//         return Clone().GetEnumerator();
//     }

//     System.Collections.IEnumerator System.Collections.IEnumerable.GetEnumerator()
//     {
//         return Clone().GetEnumerator();
//     }

//     protected static object _lock = new object();

//     public List<T> Clone()
//     {
//         List<T> newList = new List<T>();

//         lock (_lock)
//         {
//             _internalList.ForEach(x => newList.Add(x));
//         }

//         return newList;
//     }
// }
// public partial class Exchange
// {

public class BaseCache : ConcurrentList<object>
{
    // Add any custom properties or methods
    public int? maxSize;

    protected readonly object lockObject = new object();

    // public int? length;
    public BaseCache(object maxCapacity = null) : base()
    {
        // this.maxSize = maxSixe;
        this.maxSize = (maxCapacity == null) ? null : Convert.ToInt32(maxCapacity);

    }

    public void clear()
    {
        // this.Count = 0;
        lock (this.lockObject)
        {
            this.Clear();
        }
    }
}

public class ArrayCache : BaseCache
{
    // Add any custom properties or methods
    protected bool nestedNewUpdatesBySymbol;
    protected Dictionary<string, object> newUpdatesBySymbol = new Dictionary<string, object>();
    protected Dictionary<string, object> clearUpdatesBySymbol = new Dictionary<string, object>();
    protected int allNewUpdates;
    protected bool clearAllUpdates;
    public ArrayCache(object maxSixe = null) : base(maxSixe)
    {

    }

    public object getLimit(object symbol2, object limit2)
    {
        lock (this.lockObject)
        {
            return _getLimit(symbol2, limit2);
        }
    }

    private object _getLimit(object symbol2, object limit2)
    {
        // var limit = (int)limit2;
        int? newUpdatesValue = null;

        if (symbol2 == null)
        {
            newUpdatesValue = this.allNewUpdates;
            this.clearAllUpdates = true;
        }
        else
        {
            var symbol = symbol2.ToString();
            var tempNewUpdates = this.newUpdatesBySymbol[symbol];
            if ((tempNewUpdates != null) && this.nestedNewUpdatesBySymbol)
            {
                newUpdatesValue = ((HashSet<object>)tempNewUpdates).Count;
            }
            this.clearUpdatesBySymbol[symbol] = true;
        }

        if (newUpdatesValue == null)
        {
            return limit2;
        }
        else if (limit2 != null)
        {
            return Math.Min(Convert.ToInt32(newUpdatesValue), Convert.ToInt32(limit2));
        }
        else
        {
            return newUpdatesValue;
        }
    }

    public void append(object item)
    {
        lock (this.lockObject)
        {
            _append(item);
        }
    }

    private void _append(object item)
    {
        if (this.maxSize != null && this.maxSize != 0 && this.Count == this.maxSize)
        {
            this.RemoveAt(0);
        }
        this.Add(item);
        if (this.clearAllUpdates)
        {
            this.clearAllUpdates = false;
            this.clearUpdatesBySymbol = new Dictionary<string, object>();
            this.allNewUpdates = 0;
            this.newUpdatesBySymbol = new Dictionary<string, object>();
        }

        var itemSymbol = Exchange.SafeString(item, "symbol");
        var clearUpdateBySymbol = (this.clearUpdatesBySymbol.ContainsKey(itemSymbol)) ? this.clearUpdatesBySymbol[itemSymbol] : null;
        if (clearUpdateBySymbol != null)
        {
            this.clearUpdatesBySymbol[itemSymbol] = false;
            this.newUpdatesBySymbol[itemSymbol] = 0;
        }
        var defaultValue = (this.newUpdatesBySymbol.ContainsKey(itemSymbol)) ? (int)this.newUpdatesBySymbol[itemSymbol] : 0;
        this.newUpdatesBySymbol[itemSymbol] = defaultValue + 1;
        this.allNewUpdates = this.allNewUpdates + 1;
    }

    public string SerializeToJson()
    {
        lock (lockObject)
        {
            return JsonConvert.SerializeObject(this);
        }
    }
}


public class ArrayCacheByTimestamp : BaseCache
{
    public Dictionary<string, object> hashmap = new Dictionary<string, object>();
    public HashSet<object> sizeTracker = new HashSet<object>();

    public int newUpdates = 0;

    public bool clearUpdates = false;

    public ArrayCacheByTimestamp(object maxSixe = null) : base(maxSixe)
    {
    }

    public int getLimit(object symbol, object limit2)
    {
        lock (this.lockObject)
        {
            return _getLimit(symbol, limit2);
        }
    }

    private int _getLimit(object symbol, object limit2)
    {
        this.clearUpdates = true;
        if (limit2 == null)
        {
            return this.newUpdates;
        }
        var limit = (int)limit2;
        return Math.Min(this.newUpdates, limit);
    }

    public void append(object item)
    {
        lock (this.lockObject)
        {
            _append(item);
        }
    }
    private void _append(object item)
    {
        var firstValue = Exchange.SafeString(item, 0);
        if (firstValue != null && (this.hashmap.ContainsKey(firstValue)))
        {
            var prevRef = this.hashmap[firstValue];
            var index = this.IndexOf(prevRef);
            this.hashmap[firstValue] = item; // check this out
            this[index] = item;

        }
        else
        {
            this.hashmap[firstValue.ToString()] = item;
            if (this.maxSize != null && this.maxSize != 0 && (this.Count == this.maxSize))
            {
                var deletedReference = this[0];
                var deletedFirstValue = Exchange.SafeValue(deletedReference, 0);
                this.hashmap.Remove(deletedFirstValue.ToString());
            }
            this.Add(item);
        }

        if (this.clearUpdates)
        {
            this.clearUpdates = false;
            this.sizeTracker.Clear();
        }
        this.sizeTracker.Add(firstValue);
        this.newUpdates = this.sizeTracker.Count;
    }
}


public class ArrayCacheBySymbolById : ArrayCache
{
    public Dictionary<string, object> hashmap = new Dictionary<string, object>();
    // public Deque<int> index = new Queue<int>();
    public ArrayCacheBySymbolById(object maxSixe = null) : base(maxSixe)
    {
        this.nestedNewUpdatesBySymbol = true;
    }

    public void append(object item)
    {
        lock (this.lockObject)
        {
            _append(item);
        }
    }

    private void _append(object item)
    {
        var itemSymbol = Exchange.SafeString(item, "symbol");
        var itemId = Exchange.SafeString(item, "id");
        var byId = (this.hashmap.ContainsKey(itemSymbol)) ? this.hashmap[itemSymbol] as Dictionary<string, object> : new Dictionary<string, object>();
        this.hashmap[itemSymbol] = byId;
        if (byId.ContainsKey(itemId))
        {
            var reference = byId[itemId];
            if (reference != item)
            {
                reference = item;
            }
            item = reference;
            // index = new Queue<int>(index.Where(x => x != (int)reference));
            // this.index.Remove
            var value = this.Find(x => Exchange.SafeString(x, "id") == itemId);
            var indexInt = this.IndexOf(value);
            this.RemoveAt(indexInt);
            // this.index.Remove(indexInt);
        }
        else
        {
            byId[itemId] = item;
        }

        if (this.maxSize != null && (this.Count == this.maxSize))
        {
            var first = this[0];
            this.RemoveAt(0);
            var deletedSymbol = Exchange.SafeString(first, "symbol");
            var deletedId = Exchange.SafeString(first, "id");
            var secondHashMap = (this.hashmap[deletedSymbol] as Dictionary<string, object>);
            if (secondHashMap != null)
            {
                secondHashMap.Remove(deletedId);
            }
        }
        this.Add(item);

        if (this.clearAllUpdates)
        {
            this.clearAllUpdates = false;
            this.clearUpdatesBySymbol = new Dictionary<string, object>();
            this.allNewUpdates = 0;
            this.newUpdatesBySymbol = new Dictionary<string, object>();
        }

        var newUpdatesBySymbolValue = (this.newUpdatesBySymbol.ContainsKey(itemSymbol)) ? this.newUpdatesBySymbol[itemSymbol] : null;
        if (newUpdatesBySymbolValue == null)
        {
            this.newUpdatesBySymbol[itemSymbol] = new HashSet<object>();
        }

        var clearUpdatesBySymbolValue = (this.clearUpdatesBySymbol.ContainsKey(itemSymbol)) ? this.clearUpdatesBySymbol[itemSymbol] : null;
        if (clearUpdatesBySymbolValue != null)
        {
            this.clearUpdatesBySymbol[itemSymbol] = false;
            (this.newUpdatesBySymbol[itemSymbol] as HashSet<object>).Clear();
        }

        // in case an exchange updates the same order id twice
        var idSet = this.newUpdatesBySymbol[itemSymbol] as HashSet<object>;
        var beforeLength = idSet.Count;
        idSet.Add(itemId);
        var afterLength = idSet.Count;
        var defaultAllNewUpdates = (this.allNewUpdates == null) ? 0 : this.allNewUpdates;
        this.allNewUpdates = defaultAllNewUpdates + (afterLength - beforeLength);
    }
}

public class ArrayCacheBySymbolBySide : ArrayCache
{
    // tbd incomplete
    public Dictionary<string, object> hashmap = new Dictionary<string, object>();
    public ArrayCacheBySymbolBySide(int? maxSixe = null) : base(maxSixe)
    {
        this.nestedNewUpdatesBySymbol = true;
    }

    public void append(object item)
    {
        lock (this.lockObject)
        {
            _append(item);
        }
    }

    private void _append(object item)
    {
        var itemSymbol = Exchange.SafeString(item, "symbol");
        var itemSide = Exchange.SafeString(item, "side");
        var bySide = (this.hashmap.ContainsKey(itemSymbol)) ? this.hashmap[itemSide] as Dictionary<string, object> : new Dictionary<string, object>();

        if (bySide.ContainsKey(itemSide))
        {
            var reference = bySide[itemSide];
            if (reference != item)
            {
                reference = item;
            }
            item = reference;
            var value = this.Find(x => Exchange.SafeString(x, "symbol") == itemSymbol && Exchange.SafeString(x, "side") == itemSide);
            var indexInt = this.IndexOf(value);
            // move to the end
            this.RemoveAt(indexInt);

        }
        else
        {
            bySide[itemSide] = item;
        }
        this.Add(item);

        if (this.clearAllUpdates)
        {
            this.clearAllUpdates = false;
            this.clearUpdatesBySymbol = new Dictionary<string, object>();
            this.allNewUpdates = 0;
            this.newUpdatesBySymbol = new Dictionary<string, object>();
        }

        var newUpdatesBySymbolValue = (this.newUpdatesBySymbol.ContainsKey(itemSymbol)) ? this.newUpdatesBySymbol[itemSymbol] : null;
        if (newUpdatesBySymbolValue == null)
        {
            this.newUpdatesBySymbol[itemSymbol] = new HashSet<object>();
        }

        var clearUpdatesBySymbolValue = (this.clearUpdatesBySymbol.ContainsKey(itemSymbol)) ? this.clearUpdatesBySymbol[itemSymbol] : null;
        if (clearUpdatesBySymbolValue != null)
        {
            this.clearUpdatesBySymbol[itemSymbol] = false;
            (this.newUpdatesBySymbol[itemSymbol] as HashSet<object>).Clear();
        }

        var sideSet = this.newUpdatesBySymbol[itemSymbol] as HashSet<object>;
        var beforeLength = sideSet.Count;
        sideSet.Add(itemSide);
        var afterLength = sideSet.Count;
        var defaultAllNewUpdates = (this.allNewUpdates == null) ? 0 : this.allNewUpdates;
        this.allNewUpdates = defaultAllNewUpdates + (afterLength - beforeLength);
    }
}
// }