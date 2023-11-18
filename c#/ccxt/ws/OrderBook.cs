using System.Globalization;
using System.Net;
using System.Collections.Generic;
using System.Security.Cryptography.X509Certificates;

namespace ccxt;

using dict = Dictionary<string, object>;

public class OrderBook : dict
{
    public List<object> cache = new List<object>();
    public Asks asks;
    public Bids bids;

    public OrderBook(object snapshot = null, object depth2 = null)
    {
        // this.snapshot = snapshot;
        // this.depth = depth;
        var depth = (depth2 == null) ? Int32.MaxValue : (int)depth2;

        var defaults = new dict
        {
            { "bids", new List<object>() },
            { "asks", new List<object>() },
            { "timestamp", null },
            { "datetime", null },
            { "nonce", null },
            { "symbol", null },
        };
        var snapshotCopy = new dict(snapshot as dict);
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
        this.asks.limit();
        this.bids.limit();
        return this;
    }

    public OrderBook update(object snapshot)
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

    public void reset(object snapshot = null)
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

public class CountedOrderBook : OrderBook
{
    public CountedAsks asks;
    public CountedBids bids;
    public CountedOrderBook(object snapshot = null, object depth2 = null) : base(Exchange.Extend(snapshot, new dict {
       {"asks", new CountedAsks(Exchange.SafeValue(snapshot, "asks", new List<object>()), depth2)},
       {"bids", new CountedBids(Exchange.SafeValue(snapshot, "bids", new List<object>()), depth2)}
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
    public IndexedOrderBook(object snapshot = null, object depth2 = null) : base(Exchange.Extend(snapshot, new dict {
       {"asks", new IndexedAsks(Exchange.SafeValue(snapshot, "asks", new List<object>()), depth2)},
       {"bids", new IndexedBids(Exchange.SafeValue(snapshot, "bids", new List<object>()), depth2)}
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