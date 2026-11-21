using System.Threading.Tasks;
using ccxt.pro;

namespace Tests;

// A ws cache is a List<object> written by the receive loop. toArray and the generic
// filterBy*SinceLimit family must read its published snapshot, never the live list,
// or an off-loop reader races the writer (ArgumentOutOfRangeException).
public partial class BaseTest
{
    public void testWsCacheSnapshotReads()
    {
        var exchange = new ccxt.Exchange();
        var cache = new ArrayCache(3);
        for (var i = 0; i < 3; i++)
        {
            cache.append(orderRow("BTC/USDT", i.ToString(), "timestamp", 1000 + i));
        }
        var viaToArray = exchange.toArray(cache);
        Assert(!ReferenceEquals(viaToArray, cache), "toArray on a ws cache must return its snapshot, not the live list");
        var viaFilter = exchange.filterBySinceLimit<object>(cache, 1000, null, "timestamp", false);
        Assert(viaFilter.Count == 3, "filterBySinceLimit on a ws cache: expected 3 rows, got " + viaFilter.Count);
        cache.append(orderRow("BTC/USDT", "3", "timestamp", 1003));
        Assert(viaToArray.Count == 3, "a toArray snapshot must not change when the cache appends, got " + viaToArray.Count);

        // concurrent writer: every read goes through the published array, so no read throws
        var live = new ArrayCache(50);
        var stop = false;
        var writer = Task.Run(() =>
        {
            for (var i = 0; i < 200000 && !stop; i++)
            {
                live.append(orderRow("BTC/USDT", i.ToString(), "timestamp", 1000 + i));
            }
        });
        try
        {
            for (var round = 0; round < 20000 && !writer.IsCompleted; round++)
            {
                exchange.filterBySinceLimit<object>(live, 1000, null, "timestamp", false);
                exchange.filterBySymbolSinceLimit<object>(live, "BTC/USDT", 1000, null, false);
                var rows = exchange.toArray(live);
                for (var j = 0; j < rows.Count; j++)
                {
                    Assert(rows[j] != null, "a snapshot row must stay readable while the cache appends");
                }
            }
        }
        finally
        {
            stop = true;
            writer.Wait();
        }
    }
}
