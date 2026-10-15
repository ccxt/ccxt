namespace Tests;

// native cs test: the ts orderbook constructors default snapshot to {} — the
// cs transpile lost that default on IndexedOrderBook (snapshot = null piped
// raw into Exchange.Extend -> NullReferenceException), which stayed latent
// behind the bitmex ArgumentOutOfRange family until #29749 killed it and the
// bitmex orderBookL2 arm's bare this.indexedOrderBook() call started blowing
// on every snapshot. CountedOrderBook was already guarded; this locks the
// js parity in for all three ctors.

public partial class BaseTest
{
    public void testWsOrderBookNullSnapshotDefaults()
    {
        var plain = new ccxt.pro.OrderBook();
        Assert(plain["asks"] != null && plain["bids"] != null, "bare OrderBook() must build empty sides like the ts snapshot = {} default");
        plain.limit();

        var indexed = new ccxt.pro.IndexedOrderBook();
        Assert(indexed.asks != null && indexed.bids != null, "bare IndexedOrderBook() must build empty sides like the ts snapshot = {} default");
        indexed.limit();

        var counted = new ccxt.pro.CountedOrderBook();
        Assert(counted.asks != null && counted.bids != null, "bare CountedOrderBook() must build empty sides like the ts snapshot = {} default");
        counted.limit();
    }
}
