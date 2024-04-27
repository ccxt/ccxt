using Newtonsoft.Json;
using ccxt;
namespace ccxt.pro;

public class BaseCache : SlimConcurrentList<object>
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
            if (tempNewUpdates != null && !this.nestedNewUpdatesBySymbol)
            {
                newUpdatesValue = Convert.ToInt32(tempNewUpdates);
            }
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
    private bool hedged = true;
    public ArrayCacheBySymbolBySide(int? maxSixe = null, bool hedged = true) : base(maxSixe)
    {
        this.nestedNewUpdatesBySymbol = true;
        this.hedged = hedged;
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

        if (!this.hedged) {
            var sideToReset = itemSide == "long" ? "short" : "long";
            if (bySide.ContainsKey(sideToReset)) {
                bySide.Remove(sideToReset);
                var value = this.Find(x => Exchange.SafeString (x, "symbol") == itemSymbol && Exchange.SafeString (x, "side") == sideToReset);
                var indexInt = this.IndexOf(value);
                this.RemoveAt(indexInt);
            }
        }
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
