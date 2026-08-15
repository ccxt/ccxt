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

    // ts/src/base/ws/Cache.ts guards eviction with `if (this.maxSize && ...)`, a
    // JS truthiness test, so a maxSize of 0 (or undefined) means "unbounded".
    // maxSize can legitimately be 0 when a cache is copy-constructed by .filter().
    protected bool isBounded
    {
        get { return (this.maxSize != null) && (this.maxSize != 0); }
    }

    // TS indexes plain objects, where a missing field yields the string key
    // "undefined" rather than throwing. A raw null into Dictionary<string, ...>
    // throws ArgumentNullException, so normalize the key the same way TS does.
    protected static string cacheKey(object value)
    {
        return (value == null) ? "undefined" : value.ToString();
    }

    // Mirrors the TS `for (const prop in item) reference[prop] = item[prop]`
    // update path: the *stored* object is mutated in place so that any external
    // reference handed out earlier (and the hashmap entry pointing at it) stays
    // live, instead of being silently rebound to a new object.
    // Returns false when the two values cannot be merged field-wise, so callers
    // can fall back to replacing the slot.
    protected static bool mergeInto(object reference, object item)
    {
        if (object.ReferenceEquals(reference, item))
        {
            return true;
        }
        if (reference == null || item == null)
        {
            return false;
        }
        var referenceDict = reference as IDictionary<string, object>;
        var itemDict = item as IDictionary<string, object>;
        if (referenceDict != null && itemDict != null && !referenceDict.IsReadOnly)
        {
            foreach (var pair in itemDict)
            {
                referenceDict[pair.Key] = pair.Value;
            }
            return true;
        }
        // OHLCV rows are lists, so "every prop of item" means every index of item
        var referenceList = reference as IList<object>;
        var itemList = item as IList<object>;
        if (referenceList != null && itemList != null && !referenceList.IsReadOnly)
        {
            var itemCount = itemList.Count;
            for (var i = 0; i < itemCount; i++)
            {
                if (i < referenceList.Count)
                {
                    referenceList[i] = itemList[i];
                }
                else
                {
                    referenceList.Add(itemList[i]);
                }
            }
            return true;
        }
        return false;
    }

    // TS reads `if (this.clearUpdatesBySymbol[key])`, a truthiness test: it is
    // false both when the key is absent *and* when the stored value is the
    // boolean false that append() itself writes back. Checking `!= null` on a
    // boxed bool would treat that stored false as truthy and wrongly re-zero the
    // per-symbol counters on every append following a getLimit().
    protected static bool isTruthyFlag(object value)
    {
        if (value == null)
        {
            return false;
        }
        if (value is bool)
        {
            return (bool)value;
        }
        return true;
    }

    public virtual void clear()
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
    // NOTE: this is the single hashmap of the whole family. ArrayCacheBySymbolById
    // and ArrayCacheBySymbolBySide deliberately do NOT redeclare it - a shadowing
    // field would leave this base one permanently empty, which is exactly what the
    // generated exchange code reads through `(stored as ArrayCache).hashmap`
    // (pro/kraken, pro/bitmex, pro/woofipro, pro/coinbaseexchange, pro/upbit).
    public Dictionary<string, object> hashmap = new Dictionary<string, object>();
    protected bool nestedNewUpdatesBySymbol;
    protected Dictionary<string, object> newUpdatesBySymbol = new Dictionary<string, object>();
    protected Dictionary<string, object> clearUpdatesBySymbol = new Dictionary<string, object>();
    protected int allNewUpdates;
    protected bool clearAllUpdates;
    public ArrayCache(object maxSixe = null) : base(maxSixe)
    {

    }

    // Dropping the rows without dropping the bookkeeping leaves the hashmap
    // pointing at objects that are no longer in the list, so the next append of a
    // known key takes the "update" branch, mutates an orphan and never re-adds the
    // row - the item silently disappears. Reset the whole cache state together.
    public override void clear()
    {
        lock (this.lockObject)
        {
            this.Clear();
            this.hashmap.Clear();
            this.newUpdatesBySymbol.Clear();
            this.clearUpdatesBySymbol.Clear();
            this.allNewUpdates = 0;
            this.clearAllUpdates = false;
        }
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
            var symbol = cacheKey(symbol2);
            // TS reads an absent key as undefined and falls through to `return limit`;
            // the raw Dictionary indexer would throw KeyNotFoundException instead
            object tempNewUpdates = null;
            this.newUpdatesBySymbol.TryGetValue(symbol, out tempNewUpdates);
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

    public virtual void append(object item)
    {
        lock (this.lockObject)
        {
            _append(item);
        }
    }

    private void _append(object item)
    {
        // `while (Count >= maxSize)` rather than `== maxSize` so an oversized cache
        // heals itself instead of latching into unbounded growth
        while (this.isBounded && (this.Count >= this.maxSize))
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

        var itemSymbol = cacheKey(Exchange.SafeString(item, "symbol"));
        object clearUpdateBySymbol = null;
        this.clearUpdatesBySymbol.TryGetValue(itemSymbol, out clearUpdateBySymbol);
        if (isTruthyFlag(clearUpdateBySymbol))
        {
            this.clearUpdatesBySymbol[itemSymbol] = false;
            this.newUpdatesBySymbol[itemSymbol] = 0;
        }
        object previousUpdates = null;
        var defaultValue = (this.newUpdatesBySymbol.TryGetValue(itemSymbol, out previousUpdates)) ? Convert.ToInt32(previousUpdates) : 0;
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

    public override void clear()
    {
        lock (this.lockObject)
        {
            this.Clear();
            this.hashmap.Clear();
            this.sizeTracker.Clear();
            this.newUpdates = 0;
            this.clearUpdates = false;
        }
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

    public virtual void append(object item)
    {
        lock (this.lockObject)
        {
            _append(item);
        }
    }
    private void _append(object item)
    {
        // derive the insert key and the eviction key through the same helper so
        // they can never disagree and strand an entry in the hashmap
        var firstValue = cacheKey(Exchange.SafeString(item, 0));
        object reference = null;
        if (this.hashmap.TryGetValue(firstValue, out reference))
        {
            // TS mutates the candle that is already cached so that consumers holding
            // a reference to it observe the update; only fall back to swapping the
            // slot when the row cannot be merged field-wise. The position is kept
            // either way, and the hashmap keeps pointing at the live object.
            if (!mergeInto(reference, item))
            {
                var index = this.IndexOf(reference);
                if (index >= 0)
                {
                    this[index] = item;
                }
                else
                {
                    this.Add(item);
                }
                this.hashmap[firstValue] = item;
            }
        }
        else
        {
            this.hashmap[firstValue] = item;
            // this used to read this[0] and drop the hashmap key without ever
            // removing the row, so the OHLCV cache grew without bound: Count
            // overshot maxSize once and the `== maxSize` test never matched again.
            while (this.isBounded && (this.Count >= this.maxSize))
            {
                var deletedReference = this[0];
                this.RemoveAt(0);
                this.hashmap.Remove(cacheKey(Exchange.SafeString(deletedReference, 0)));
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
    public string keyField = "symbol"; // first nesting level (overridden by ArrayCacheByOutcomeById)
    // public Deque<int> index = new Queue<int>();
    public ArrayCacheBySymbolById(object maxSixe = null) : base(maxSixe)
    {
        this.nestedNewUpdatesBySymbol = true;
    }

    public override void append(object item)
    {
        lock (this.lockObject)
        {
            _append(item);
        }
    }

    private void _append(object item)
    {
        var itemSymbol = cacheKey(Exchange.SafeString(item, this.keyField));
        var itemId = cacheKey(Exchange.SafeString(item, "id"));
        object byIdValue = null;
        var byId = (this.hashmap.TryGetValue(itemSymbol, out byIdValue)) ? byIdValue as Dictionary<string, object> : null;
        if (byId == null)
        {
            byId = new Dictionary<string, object>();
        }
        this.hashmap[itemSymbol] = byId;
        object reference = null;
        if (byId.TryGetValue(itemId, out reference))
        {
            // copy the incoming fields onto the *stored* order rather than rebinding
            // a local, so the object in the list and in the hashmap is the one that
            // actually gets updated
            if (mergeInto(reference, item))
            {
                item = reference;
            }
            else
            {
                byId[itemId] = item;
            }
            // match on both the key field (e.g. symbol) and id - different symbols can
            // share an order id (binance uses per-symbol id sequences), and matching on
            // id alone would remove the wrong row, see ccxt/ccxt#26092
            var indexInt = this.FindIndex(x => (Exchange.SafeString(x, "id") == itemId) && (Exchange.SafeString(x, this.keyField) == itemSymbol));
            // move the order to the end of the array
            if (indexInt >= 0)
            {
                this.RemoveAt(indexInt);
            }
        }
        else
        {
            byId[itemId] = item;
        }

        while (this.isBounded && (this.Count >= this.maxSize))
        {
            var first = this[0];
            this.RemoveAt(0);
            var deletedSymbol = cacheKey(Exchange.SafeString(first, this.keyField));
            var deletedId = cacheKey(Exchange.SafeString(first, "id"));
            object deletedBucketValue = null;
            if (this.hashmap.TryGetValue(deletedSymbol, out deletedBucketValue))
            {
                var secondHashMap = deletedBucketValue as Dictionary<string, object>;
                if (secondHashMap != null)
                {
                    secondHashMap.Remove(deletedId);
                    // drop the outer entry too once its last id is gone, otherwise the
                    // symbol keys accumulate forever on a long lived orders stream
                    if (secondHashMap.Count == 0)
                    {
                        this.hashmap.Remove(deletedSymbol);
                    }
                }
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

        object newUpdatesBySymbolValue = null;
        this.newUpdatesBySymbol.TryGetValue(itemSymbol, out newUpdatesBySymbolValue);
        if (newUpdatesBySymbolValue == null)
        {
            this.newUpdatesBySymbol[itemSymbol] = new HashSet<object>();
        }

        object clearUpdatesBySymbolValue = null;
        this.clearUpdatesBySymbol.TryGetValue(itemSymbol, out clearUpdatesBySymbolValue);
        if (isTruthyFlag(clearUpdatesBySymbolValue))
        {
            this.clearUpdatesBySymbol[itemSymbol] = false;
            (this.newUpdatesBySymbol[itemSymbol] as HashSet<object>).Clear();
        }

        // in case an exchange updates the same order id twice
        var idSet = this.newUpdatesBySymbol[itemSymbol] as HashSet<object>;
        var beforeLength = idSet.Count;
        idSet.Add(itemId);
        var afterLength = idSet.Count;
        var defaultAllNewUpdates = this.allNewUpdates;
        this.allNewUpdates = defaultAllNewUpdates + (afterLength - beforeLength);
    }
}

public class ArrayCacheByOutcomeById : ArrayCacheBySymbolById
{
    public ArrayCacheByOutcomeById(object maxSixe = null) : base(maxSixe)
    {
        this.keyField = "outcome";
    }
}

public class ArrayCacheBySymbolBySide : ArrayCache
{
    // NOTE: no eviction here on purpose - the TS ArrayCacheBySymbolBySide takes no
    // maxSize at all and never trims. The parameter is kept only so the 55 existing
    // call sites keep compiling; it is intentionally not enforced.
    public ArrayCacheBySymbolBySide(int? maxSixe = null) : base(maxSixe)
    {
        this.nestedNewUpdatesBySymbol = true;
    }

    public override void append(object item)
    {
        lock (this.lockObject)
        {
            _append(item);
        }
    }

    private void _append(object item)
    {
        var itemSymbol = cacheKey(Exchange.SafeString(item, "symbol"));
        var itemSide = cacheKey(Exchange.SafeString(item, "side"));
        object bySideValue = null;
        var bySide = (this.hashmap.TryGetValue(itemSymbol, out bySideValue)) ? bySideValue as Dictionary<string, object> : null;
        if (bySide == null)
        {
            bySide = new Dictionary<string, object>();
        }
        this.hashmap[itemSymbol] = bySide;
        object reference = null;
        if (bySide.TryGetValue(itemSide, out reference))
        {
            if (mergeInto(reference, item))
            {
                item = reference;
            }
            else
            {
                bySide[itemSide] = item;
            }
            var indexInt = this.FindIndex(x => Exchange.SafeString(x, "symbol") == itemSymbol && Exchange.SafeString(x, "side") == itemSide);
            // move to the end
            if (indexInt >= 0)
            {
                this.RemoveAt(indexInt);
            }
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

        object newUpdatesBySymbolValue = null;
        this.newUpdatesBySymbol.TryGetValue(itemSymbol, out newUpdatesBySymbolValue);
        if (newUpdatesBySymbolValue == null)
        {
            this.newUpdatesBySymbol[itemSymbol] = new HashSet<object>();
        }

        object clearUpdatesBySymbolValue = null;
        this.clearUpdatesBySymbol.TryGetValue(itemSymbol, out clearUpdatesBySymbolValue);
        if (isTruthyFlag(clearUpdatesBySymbolValue))
        {
            this.clearUpdatesBySymbol[itemSymbol] = false;
            (this.newUpdatesBySymbol[itemSymbol] as HashSet<object>).Clear();
        }

        var sideSet = this.newUpdatesBySymbol[itemSymbol] as HashSet<object>;
        var beforeLength = sideSet.Count;
        sideSet.Add(itemSide);
        var afterLength = sideSet.Count;
        var defaultAllNewUpdates = this.allNewUpdates;
        this.allNewUpdates = defaultAllNewUpdates + (afterLength - beforeLength);
    }
}
// }
