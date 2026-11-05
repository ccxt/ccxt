namespace ccxt;

public partial class BaseExchange
{
    // The synchronous TS implementation cannot interleave with the receive loop.
    // C# continuations and message handlers can run on separate threads, so its
    // newUpdates read must capture the count and rows in one cache operation.
    public virtual Dictionary<string, object> getCacheRead(object cache, object symbol = null, object limit = null)
    {
        if (this.newUpdates)
        {
            return ((ccxt.pro.BaseCache)cache).getLimitAndSnapshot(symbol, limit);
        }
        return new Dictionary<string, object>() {
            { "data", cache },
            { "limit", limit },
        };
    }
}
