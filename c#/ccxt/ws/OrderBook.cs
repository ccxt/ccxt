
namespace ccxt;

using Newtonsoft.Json;


using dict = IDictionary<string, object>;

public class OrderBook : CustomConcurrentDictionary<string, object>
{
    // protected readonly object _syncRoot = new object();
    private IList<object> _cache = new SlimConcurrentList<object>();

    public IList<object> cache
    {
        get
        {
            lock (_syncRoot)
            {
                return _cache;
            }
        }
        set
        {
            lock (_syncRoot)
            {
                _cache = value;
            }
        }
    }

    private Asks _asks;

    public Asks asks
    {
        get
        {
            lock (_syncRoot)
            {
                return _asks;
            }
        }
        set
        {
            lock (_syncRoot)
            {
                _asks = value;
            }
        }
    }
    private Bids _bids;

    public Bids bids
    {
        get
        {
            lock (_syncRoot)
            {
                return _bids;
            }
        }
        set
        {
            lock (_syncRoot)
            {
                _bids = value;
            }
        }
    }

    public OrderBook(object snapshot = null, object depth2 = null)
    {
        // this.snapshot = snapshot;
        // this.depth = depth;
        var depth = (depth2 == null) ? Int32.MaxValue : Convert.ToInt32(depth2);

        var defaults = new CustomConcurrentDictionary<string, object>
        {
            { "bids", new SlimConcurrentList<object>() },
            { "asks", new SlimConcurrentList<object>() },
            { "timestamp", null },
            { "datetime", null },
            { "nonce", null },
            { "symbol", null },
        };
        var snapshotCopy = new CustomConcurrentDictionary<string, object> { };
        if (snapshot != null)
        {
            snapshotCopy = new CustomConcurrentDictionary<string, object>(snapshot as dict);
        }
        defaults["bids"] = Exchange.SafeValue(snapshotCopy, "bids", defaults["bids"]);
        defaults["asks"] = Exchange.SafeValue(snapshotCopy, "asks", defaults["asks"]);
        defaults["timestamp"] = Exchange.SafeValue(snapshotCopy, "timestamp", defaults["timestamp"]);
        defaults["datetime"] = Exchange.Iso8601(defaults["timestamp"]);
        defaults["nonce"] = Exchange.SafeValue(snapshotCopy, "nonce", defaults["nonce"]);
        defaults["symbol"] = Exchange.SafeValue(snapshotCopy, "symbol", defaults["symbol"]);

        // this.Merge(defaults);
        for (var i = 0; i < defaults.Count; i++)
        {
            this.Add(defaults.Keys.ElementAt(i), defaults.Values.ElementAt(i));
        }

        if (!(this["asks"] is OrderBookSide)) // check this out should it be OrderBookSide?
        {
            this["asks"] = new Asks(this["asks"], depth);
            this.asks = this["asks"] as Asks;
        }

        if (!(this["bids"] is OrderBookSide)) // same here
        {
            this["bids"] = new Bids(this["bids"], depth);
            this.bids = this["bids"] as Bids;
        }
    }

    public OrderBook limit()
    {

        lock (_syncRoot)
        {
            this.asks.limit();
            this.bids.limit();
            return this;
        }
    }

    public OrderBook update(object snapshot)
    {
        lock (_syncRoot)
        {
            var snapshotNonce = Exchange.SafeValue(snapshot as dict, "nonce");
            if (snapshotNonce != null && this["nonce"] != null && (long)snapshotNonce <= (long)this["nonce"])
            {
                return this;
            }

            this["nonce"] = snapshotNonce;
            this["timestamp"] = Exchange.SafeValue(snapshot as dict, "timestamp", this["timestamp"]);
            this["datetime"] = Exchange.SafeValue(snapshot as dict, "datetime", this["datetime"]);
            this.reset(snapshot);
            return null;
        }
    }

    public void reset(object snapshot = null)
    {
        lock (_syncRoot)
        {
            this.asks._index.Clear();
            this.asks.Clear();

            var snapshotAsks = Exchange.SafeValue(snapshot as dict, "asks") as List<object>;
            for (var i = 0; i < snapshotAsks.Count; i++)
            {
                this.asks.storeArray(snapshotAsks[i] as List<object>);
            }

            this.bids._index.Clear();
            this.bids.Clear();
            var snapshotBids = Exchange.SafeValue(snapshot as dict, "bids") as List<object>;
            for (var i = 0; i < snapshotBids.Count; i++)
            {
                this.bids.storeArray(snapshotBids[i] as List<object>);
            }
            this["nonce"] = Exchange.SafeValue(snapshot as dict, "nonce", this["nonce"]);
            this["timestamp"] = Exchange.SafeValue(snapshot as dict, "timestamp", this["timestamp"]);
            this["datetime"] = Exchange.Iso8601(this["timestamp"]);
            this["symbol"] = Exchange.SafeValue(snapshot as dict, "symbol", this["symbol"]);
        }
    }

    public OrderBook GetCopy()
    {
        lock (_syncRoot)
        {
            var copy = new OrderBook();
            copy["asks"] = this.asks.GetCopy();
            copy["bids"] = this.bids.GetCopy();
            copy["nonce"] = this["nonce"];
            copy["timestamp"] = this["timestamp"];
            copy["datetime"] = this["datetime"];
            copy["symbol"] = this["symbol"];
            // copy["nonce"] = this["nonce"];
            // copy["timestamp"] = this["timestamp"];
            // copy["datetime"] = this["datetime"];
            // copy["symbol"] = this["symbol"];
            // copy["asks"] = new Asks(this._asks.ToList());
            // copy["bids"] = new Bids(this._bids.ToList());
            return copy;
        }
    }

    public IEnumerator<KeyValuePair<string, object>> GetEnumerator()
    {
        lock (_syncRoot)
        {
            return new CustomConcurrentDictionary<string, object>(this).GetEnumerator();
        }
    }

    // public IEnumerator<object> GetEnumerator()
    // {
    //     lock (_syncRoot)
    //     {
    //         return new List<object>(_cache).GetEnumerator();
    //     }
    // }

    // Serialize the object safely
    public string Serialize()
    {
        lock (_syncRoot)
        {
            // Create an immutable snapshot for serialization
            var snapshot = new Dictionary<string, object>(this);

            return JsonConvert.SerializeObject(snapshot);
        }
    }
}

public class CountedOrderBook : OrderBook
{
    public CountedAsks asks;
    public CountedBids bids;
    public CountedOrderBook(object snapshot = null, object depth2 = null) : base(Exchange.Extend(snapshot, new CustomConcurrentDictionary<string, object> {
       {"asks", new CountedAsks(Exchange.SafeValue(snapshot, "asks", new SlimConcurrentList<object>()), depth2)},
       {"bids", new CountedBids(Exchange.SafeValue(snapshot, "bids", new SlimConcurrentList<object>()), depth2)}
    }), depth2)
    {

        this.asks = this["asks"] as CountedAsks;
        this.bids = this["bids"] as CountedBids;
    }

    public CountedOrderBook limit()
    {
        this.asks.limit();
        this.bids.limit();
        return this;
    }
}


public class IndexedOrderBook : OrderBook
{
    public IndexedAsks asks;
    public IndexedBids bids;
    public IndexedOrderBook(object snapshot = null, object depth2 = null) : base(Exchange.Extend(snapshot, new CustomConcurrentDictionary<string, object> {
       {"asks", new IndexedAsks(Exchange.SafeValue(snapshot, "asks", new SlimConcurrentList<object>()), depth2)},
       {"bids", new IndexedBids(Exchange.SafeValue(snapshot, "bids", new SlimConcurrentList<object>()), depth2)}
    }), depth2)
    {

        this.asks = this["asks"] as IndexedAsks;
        this.bids = this["bids"] as IndexedBids;
    }

    public IndexedOrderBook limit()
    {
        this.asks.limit();
        this.bids.limit();
        return this;
    }
}