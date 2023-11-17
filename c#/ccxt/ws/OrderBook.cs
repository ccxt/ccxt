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
        defaults["datetime"] = Exchange.SafeValue(snapshotCopy, "datetime", defaults["datetime"]);
        defaults["nonce"] = Exchange.SafeValue(snapshotCopy, "nonce", defaults["nonce"]);
        defaults["symbol"] = Exchange.SafeValue(snapshotCopy, "symbol", defaults["symbol"]);

        if (!(defaults["bids"] is OrderBookSide))
        {
            defaults["bids"] = new Bids(defaults["bids"], depth);
            this.bids = defaults["bids"] as Bids;
        }

        if (!(defaults["asks"] is Asks))
        {
            defaults["asks"] = new Asks(defaults["asks"], depth);
            this.asks = defaults["asks"] as Asks;
        }

        // this.Merge(defaults);
        for (var i = 0; i < defaults.Count; i++)
        {
            this.Add(defaults.Keys.ElementAt(i), defaults.Values.ElementAt(i));
        }
    }

    public OrderBook limit()
    {
        this.asks.limit();
        this.bids.limit();
        return this;
    }
}