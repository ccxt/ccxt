
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

    String symbol { get; set; }

    long? nonce { get; set; }
    long? timestamp { get; set; }
    public IList<object> cache { get; set; }
}

public class OrderBook : CustomConcurrentDictionary<string, object>, IOrderBook
{
    // One store: this dictionary. asks / bids / symbol / nonce / timestamp
    // are typed views of the same slots, so book.asks and book["asks"] cannot
    // drift. Extra keys (datetime, outcome, …) live only in the indexer.

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

    public IAsks asks
    {
        get
        {
            lock (_syncRoot)
            {
                object value;
                if (!this.TryGetValue("asks", out value))
                {
                    return null;
                }
                return value as IAsks;
            }
        }
        set
        {
            lock (_syncRoot)
            {
                this["asks"] = value;
            }
        }
    }

    public IBids bids
    {
        get
        {
            lock (_syncRoot)
            {
                object value;
                if (!this.TryGetValue("bids", out value))
                {
                    return null;
                }
                return value as IBids;
            }
        }
        set
        {
            lock (_syncRoot)
            {
                this["bids"] = value;
            }
        }
    }

    public String symbol
    {
        get
        {
            lock (_syncRoot)
            {
                object value;
                if (!this.TryGetValue("symbol", out value) || value == null)
                {
                    return null;
                }
                return value.ToString();
            }
        }
        set
        {
            lock (_syncRoot)
            {
                this["symbol"] = value;
            }
        }
    }

    public long? nonce
    {
        get
        {
            lock (_syncRoot)
            {
                object value;
                if (!this.TryGetValue("nonce", out value) || value == null)
                {
                    return null;
                }
                return Convert.ToInt64(value);
            }
        }
        set
        {
            lock (_syncRoot)
            {
                this["nonce"] = value;
            }
        }
    }

    public long? timestamp
    {
        get
        {
            lock (_syncRoot)
            {
                object value;
                if (!this.TryGetValue("timestamp", out value) || value == null)
                {
                    return null;
                }
                return Convert.ToInt64(value);
            }
        }
        set
        {
            lock (_syncRoot)
            {
                this["timestamp"] = value;
            }
        }
    }

    public OrderBook(object snapshot = null, object depth2 = null)
    {
        var depth = (depth2 == null) ? Int32.MaxValue : Convert.ToInt32(depth2);

        var snapshotCopy = new CustomConcurrentDictionary<string, object> { };
        if (snapshot != null)
        {
            snapshotCopy = new CustomConcurrentDictionary<string, object>(snapshot as dict);
        }
        var rawAsks = Exchange.SafeValue(snapshotCopy, "asks", new SlimConcurrentList<object>());
        var rawBids = Exchange.SafeValue(snapshotCopy, "bids", new SlimConcurrentList<object>());
        var rawTimestamp = Exchange.SafeValue(snapshotCopy, "timestamp");
        var rawNonce = Exchange.SafeValue(snapshotCopy, "nonce");
        var rawSymbol = Exchange.SafeValue(snapshotCopy, "symbol");

        this.asks = (rawAsks is IAsks existingAsks) ? existingAsks : new Asks(rawAsks, depth);
        this.bids = (rawBids is IBids existingBids) ? existingBids : new Bids(rawBids, depth);
        this.timestamp = (rawTimestamp == null) ? null : Convert.ToInt64(rawTimestamp);
        this["datetime"] = Exchange.Iso8601(rawTimestamp);
        this.nonce = (rawNonce == null) ? null : Convert.ToInt64(rawNonce);
        this.symbol = (rawSymbol == null) ? null : rawSymbol.ToString();
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
            if (snapshotNonce != null && this.nonce != null && (long)snapshotNonce <= this.nonce)
            {
                return this;
            }

            this["nonce"] = snapshotNonce;
            this["timestamp"] = Exchange.SafeValue(snapshot as dict, "timestamp", this["timestamp"]);
            this["datetime"] = Exchange.SafeValue(snapshot as dict, "datetime", this["datetime"]);
            this["symbol"] = Exchange.SafeString(snapshot as dict, "symbol", this.symbol);
            this.reset(snapshot);
            return null;
        }
    }

    public void reset(object snapshot = null)
    {
        lock (_syncRoot)
        {
            var askSide = this.asks as OrderBookSide;
            askSide._index.Clear();
            askSide.Clear();

            var snapshotAsks = Exchange.SafeValue(snapshot as dict, "asks") as List<object>;
            if (snapshotAsks != null)
            {
                for (var i = 0; i < snapshotAsks.Count; i++)
                {
                    this.asks.storeArray(snapshotAsks[i] as List<object>);
                }
            }

            var bidSide = this.bids as OrderBookSide;
            bidSide._index.Clear();
            bidSide.Clear();
            var snapshotBids = Exchange.SafeValue(snapshot as dict, "bids") as List<object>;
            if (snapshotBids != null)
            {
                for (var i = 0; i < snapshotBids.Count; i++)
                {
                    this.bids.storeArray(snapshotBids[i] as List<object>);
                }
            }
            this["nonce"] = Exchange.SafeValue(snapshot as dict, "nonce", this["nonce"]);
            this["timestamp"] = Exchange.SafeValue(snapshot as dict, "timestamp", this["timestamp"]);
            this["datetime"] = Exchange.Iso8601(this["timestamp"]);
            this["symbol"] = Exchange.SafeValue(snapshot as dict, "symbol", this["symbol"]);
            // prediction-market identity — only attach when present, so crypto books are unchanged
            if ((snapshot as dict) != null && (snapshot as dict).ContainsKey("outcome"))
            {
                this["outcome"] = Exchange.SafeValue(snapshot as dict, "outcome");
                this["outcomeId"] = Exchange.SafeValue(snapshot as dict, "outcomeId");
                this["market"] = Exchange.SafeValue(snapshot as dict, "market");
            }
        }
    }

    public IOrderBook Copy()
    {
        lock (_syncRoot)
        {
            // Both sides must be observed as of the SAME instant: each side is
            // guarded by its own monitor and storeArray takes only that one, so
            // a ws delta arriving on a threadpool thread between the two side
            // copies would yield a snapshot whose halves come from different
            // book states (symptom: bids[0][0] >= asks[0][0], with the stale ask
            // level still listed). Hold asks then bids across the whole
            // snapshot; the order is fixed and every writer takes at most one
            // side monitor, so the pair cannot cycle. Inside these locks the
            // sides are copied through CopyUnlocked, so neither monitor is
            // entered twice. storeArray is untouched — only Copy() pays.
            var askSide = this.asks;
            var bidSide = this.bids;
            lock (askSide)
            {
                lock (bidSide)
                {
                    var copy = new OrderBook(new Dictionary<string, object>());
                    copy.asks = (askSide as Asks).CopyUnlocked();
                    copy.bids = (bidSide as Bids).CopyUnlocked();
                    copy.nonce = this.nonce;
                    copy.timestamp = this.timestamp;
                    copy["datetime"] = this["datetime"];
                    copy.symbol = this.symbol;
                    if (this.ContainsKey("outcome"))
                    {
                        copy["outcome"] = this["outcome"];
                        copy["outcomeId"] = Exchange.SafeValue(this as dict, "outcomeId");
                        copy["market"] = Exchange.SafeValue(this as dict, "market");
                    }
                    return copy;
                }
            }
        }
    }

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
    public new CountedAsks asks
    {
        get { return base.asks as CountedAsks; }
        set { base.asks = value; }
    }
    public new CountedBids bids
    {
        get { return base.bids as CountedBids; }
        set { base.bids = value; }
    }

    public CountedOrderBook(object snapshot = null, object depth2 = null) : base(Exchange.Extend(snapshot ?? new Dictionary<string, object>(), new CustomConcurrentDictionary<string, object> {
       {"asks", new CountedAsks(Exchange.SafeValue(snapshot ?? new Dictionary<string,object>(), "asks", new SlimConcurrentList<object>()), depth2)},
       {"bids", new CountedBids(Exchange.SafeValue(snapshot ?? new Dictionary<string,object>(), "bids", new SlimConcurrentList<object>()), depth2)}
    }), depth2)
    {
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
            // same atomicity requirement and same asks-then-bids order as
            // OrderBook.Copy
            var askSide = this.asks;
            var bidSide = this.bids;
            lock (askSide)
            {
                lock (bidSide)
                {
                    var copy = new CountedOrderBook(new Dictionary<string, object>());
                    copy.asks = askSide.CopyUnlocked() as CountedAsks;
                    copy.bids = bidSide.CopyUnlocked() as CountedBids;
                    copy.nonce = this.nonce;
                    copy.timestamp = this.timestamp;
                    copy["datetime"] = this["datetime"];
                    copy.symbol = this.symbol;
                    return copy;
                }
            }
        }
    }
}


public class IndexedOrderBook : OrderBook, IOrderBook
{
    public new IndexedAsks asks
    {
        get { return base.asks as IndexedAsks; }
        set { base.asks = value; }
    }
    public new IndexedBids bids
    {
        get { return base.bids as IndexedBids; }
        set { base.bids = value; }
    }
    public IndexedOrderBook(object snapshot = null, object depth2 = null) : base(Exchange.Extend(snapshot ?? new Dictionary<string, object>(), new CustomConcurrentDictionary<string, object> {
       {"asks", new IndexedAsks(Exchange.SafeValue(snapshot ?? new Dictionary<string,object>(), "asks", new SlimConcurrentList<object>()), depth2)},
       {"bids", new IndexedBids(Exchange.SafeValue(snapshot ?? new Dictionary<string,object>(), "bids", new SlimConcurrentList<object>()), depth2)}
    }), depth2)
    {
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
            // same atomicity requirement and same asks-then-bids order as
            // OrderBook.Copy
            var askSide = this.asks;
            var bidSide = this.bids;
            lock (askSide)
            {
                lock (bidSide)
                {
                    var copy = new IndexedOrderBook(new Dictionary<string, object>());
                    copy.asks = askSide.CopyUnlocked() as IndexedAsks;
                    copy.bids = bidSide.CopyUnlocked() as IndexedBids;
                    copy.nonce = this.nonce;
                    copy.timestamp = this.timestamp;
                    copy["datetime"] = this["datetime"];
                    copy.symbol = this.symbol;
                    return copy;
                }
            }
        }
    }
}
