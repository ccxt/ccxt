
namespace ccxt.pro;

using Newtonsoft.Json;


using dict = IDictionary<string, object>;

public interface IOrderBook : IDictionary<string, object>
{
    IOrderBook limit();
    void reset(object snapshot = null);
    IOrderBook Copy();
    public IOrderBook update(object snapshot);
    IAsks asks { get; set; }
    IBids bids { get; set; }
}

public class OrderBook : CustomConcurrentDictionary<string, object>, IOrderBook
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

    public virtual IAsks asks
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
                _asks = value as Asks;
            }
        }
    }
    private Bids _bids;

    public virtual IBids bids
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
                _bids = value as Bids;
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

    public IOrderBook limit()
    {

        lock (_syncRoot)
        {
            this.asks.limit();
            this.bids.limit();
            return this;
        }
    }

    public IOrderBook update(object snapshot)
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
            this._asks._index.Clear();
            this._asks.Clear();

            var snapshotAsks = Exchange.SafeValue(snapshot as dict, "asks") as List<object>;
            for (var i = 0; i < snapshotAsks.Count; i++)
            {
                this.asks.storeArray(snapshotAsks[i] as List<object>);
            }

            this._bids._index.Clear();
            this._bids.Clear();
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

    public IOrderBook Copy()
    {
        lock (_syncRoot)
        {
            // var copy = new OrderBook(new Dictionary<string, object>(){
            //     {"asks", (this.asks.GetCopy() as IList<object>)},
            //     {"bids", (this.bids.GetCopy() as IList<object>)},
            //     {"nonce", this["nonce"]},
            //     {"timestamp", this["timestamp"]},
            //     {"datetime", this["datetime"]},
            //     {"symbol", this["symbol"]},
            // });
            var copy = new OrderBook(new Dictionary<string, object>());
            copy["asks"] = this.asks.Copy();
            copy["bids"] = this.bids.Copy();
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

public class CountedOrderBook : OrderBook, IOrderBook
{
    private CountedAsks _asks;
    private CountedBids _bids;

    public override IAsks asks
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
                _asks = value as CountedAsks;
            }
        }
    }
    public override IBids bids
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
                _bids = value as CountedBids;
            }
        }
    }



    public CountedOrderBook(object snapshot = null, object depth2 = null) : base(Exchange.Extend(snapshot ?? new Dictionary<string,object>(), new CustomConcurrentDictionary<string, object> {
       {"asks", new CountedAsks(Exchange.SafeValue(snapshot ?? new Dictionary<string,object>(), "asks", new SlimConcurrentList<object>()), depth2)},
       {"bids", new CountedBids(Exchange.SafeValue(snapshot ?? new Dictionary<string,object>(), "bids", new SlimConcurrentList<object>()), depth2)}
    }), depth2)
    {

        this.asks = this["asks"] as CountedAsks;
        this.bids = this["bids"] as CountedBids;
    }

    public IOrderBook limit()
    {
        this.asks.limit();
        this.bids.limit();
        return this;
    }


    public IOrderBook Copy()
    {
        lock (_syncRoot)
        {
            var copy = new CountedOrderBook(new Dictionary<string, object>());
            copy["asks"] = this.asks.Copy();
            copy["bids"] = this.bids.Copy();
            copy["nonce"] = this["nonce"];
            copy["timestamp"] = this["timestamp"];
            copy["datetime"] = this["datetime"];
            copy["symbol"] = this["symbol"];
            return copy;
        }
    }
}


public class IndexedOrderBook : OrderBook, IOrderBook
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

    public IOrderBook limit()
    {
        this.asks.limit();
        this.bids.limit();
        return this;
    }

    public IOrderBook Copy()
    {
        lock (_syncRoot)
        {
            var copy = new IndexedOrderBook(new Dictionary<string, object>());
            copy["asks"] = this.asks.Copy();
            copy["bids"] = this.bids.Copy();
            copy["nonce"] = this["nonce"];
            copy["timestamp"] = this["timestamp"];
            copy["datetime"] = this["datetime"];
            copy["symbol"] = this["symbol"];
            return copy;
        }
    }
}