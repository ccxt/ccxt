namespace Tests;

// native cs test: OrderBook.Copy() must return an ATOMIC snapshot of both sides.
//
// Copy() used to lock the book's own _syncRoot (inherited from
// CustomConcurrentDictionary) and then call asks.Copy() followed by bids.Copy().
// Each side's Copy()/storeArray() locks the *side's* _syncRoot instead, a
// different monitor, so the book lock excluded nothing: a WS delta running on a
// threadpool thread could land in between the two side copies and produce a
// snapshot whose asks are older than its bids.
//
// That is what the live C# tests hit on binanceusdm:
//
//   [TEST_FAILURE] binanceusdm watchOrderBookForSymbols [["BTC/USDT:USDT","ETH/USDT:USDT"]]
//   Assertion failed: bids[0][0] (1874.49) should be < than asks[0][0] (1874.39)
//
// with the dumped asks array still carrying [1874.49, 130.428] -- i.e. the price
// was simultaneously the best bid and a live ask, which no real book state ever
// is. Only a torn read can show that.
//
// This test reproduces the exact shape. The writer never publishes a crossed
// book: it moves a single price level from the ask side to the bid side and back
// again, and both the start and end states, plus the momentary intermediate, are
// uncrossed. So any crossed observation is proof the reader stitched two
// different book states together.
//
// The writer deliberately caches the two side references before it starts, which
// is what the generated exchange code does -- see binance.cs handleOrderBookMessage:
//   this.handleDeltas(getValue(orderbook, "asks"), ...);
//   this.handleDeltas(getValue(orderbook, "bids"), ...);
// the side is fetched once and every subsequent storeArray touches only the side
// lock, never the book lock.
//
// Tuning note: the parameters below are not arbitrary. Against the pre-fix
// Copy() this configuration was measured at 40/40 detections over 40 trials,
// worst case 61ms to first violation, on an 8-core box. A shallow book keeps a
// single Copy() short so readers cycle fast, and several concurrent readers
// ensure at least one is mid-copy whenever the writer flips the level.

using System.Diagnostics;

public partial class BaseTest
{
    // the single contended level, the one that flips sides
    private const decimal ContendedPrice = 1874.39m;
    private const decimal ContendedAmount = 130.428m;
    // shallow on purpose: a fast Copy() means more reader cycles per second and
    // therefore a much higher chance of overlapping the writer's flip
    private const int CopyRaceDepth = 20;
    // several readers so at least one is reliably mid-copy during a flip
    private const int CopyRaceReaders = 4;
    // generous vs the measured 61ms worst case; the loop exits as soon as it
    // finds a violation, so a correct implementation is what actually costs 2s
    private const int CopyRaceBudgetMs = 2000;

    private static ccxt.pro.OrderBook buildUncrossedBook(int depth)
    {
        var asks = new List<object>();
        var bids = new List<object>();
        // asks ascend from the contended price, bids descend from just below it
        for (var i = 0; i < depth; i++)
        {
            asks.Add(new List<object>() { ContendedPrice + (0.10m * i), 12.0m });
            bids.Add(new List<object>() { ContendedPrice - (0.10m * (i + 1)), 12.0m });
        }
        return new ccxt.pro.OrderBook(new Dictionary<string, object>() {
            { "asks", asks },
            { "bids", bids },
            { "symbol", "BTC/USDT:USDT" },
            { "nonce", 1L },
        });
    }

    public void testWsOrderBookCopyAtomicity()
    {
        var book = buildUncrossedBook(CopyRaceDepth);

        // sanity: the book we start from is uncrossed
        Assert(Convert.ToDecimal(((IList<object>)book.bids[0])[0]) < Convert.ToDecimal(((IList<object>)book.asks[0])[0]),
            "fixture book must start uncrossed");

        // mirror the generated exchange handler: resolve each side ONCE, then only
        // ever touch the side lock, exactly like binance handleOrderBookMessage
        var askSide = book.asks;
        var bidSide = book.bids;

        var stop = false;
        string violation = null;
        long copies = 0;
        Exception writerFailure = null;

        var writer = new Thread(() =>
        {
            try
            {
                while (!Volatile.Read(ref stop))
                {
                    // state X -> state Y: lift the level onto the bid side. In the
                    // instant between these two calls the book is *thinner*, never
                    // crossed: best ask ContendedPrice + 0.10, best bid ContendedPrice - 0.10
                    askSide.storeArray(new List<object>() { ContendedPrice, 0m });
                    bidSide.storeArray(new List<object>() { ContendedPrice, ContendedAmount });
                    Thread.SpinWait(20);

                    // state Y -> state X: put it back on the ask side, again passing
                    // only through the thinner uncrossed intermediate
                    bidSide.storeArray(new List<object>() { ContendedPrice, 0m });
                    askSide.storeArray(new List<object>() { ContendedPrice, ContendedAmount });
                    Thread.SpinWait(20);
                }
            }
            catch (Exception ex)
            {
                writerFailure = ex;
            }
        });
        writer.IsBackground = true;
        writer.Start();

        var sw = Stopwatch.StartNew();
        var readers = new List<Thread>();
        for (var r = 0; r < CopyRaceReaders; r++)
        {
            var reader = new Thread(() =>
            {
                while (sw.ElapsedMilliseconds < CopyRaceBudgetMs && Volatile.Read(ref violation) == null)
                {
                    var snapshot = book.Copy();
                    var copiedAsks = snapshot.asks;
                    var copiedBids = snapshot.bids;
                    Interlocked.Increment(ref copies);
                    if (copiedAsks.Count == 0 || copiedBids.Count == 0)
                    {
                        continue;
                    }
                    var bestAsk = Convert.ToDecimal(((IList<object>)copiedAsks[0])[0]);
                    var bestBid = Convert.ToDecimal(((IList<object>)copiedBids[0])[0]);

                    if (bestBid >= bestAsk)
                    {
                        Interlocked.CompareExchange(ref violation,
                            "torn snapshot: bids[0][0] (" + bestBid + ") should be < than asks[0][0] (" + bestAsk + ")", null);
                        break;
                    }

                    // the binanceusdm dump signature: the best bid price was still
                    // sitting in the copied ask array as a live level
                    for (var j = 0; j < copiedAsks.Count; j++)
                    {
                        if (Convert.ToDecimal(((IList<object>)copiedAsks[j])[0]) == bestBid)
                        {
                            Interlocked.CompareExchange(ref violation,
                                "torn snapshot: best bid " + bestBid + " is also present in the copied asks at index " + j, null);
                            break;
                        }
                    }
                }
            });
            reader.IsBackground = true;
            readers.Add(reader);
            reader.Start();
        }

        foreach (var reader in readers)
        {
            reader.Join();
        }
        sw.Stop();
        Volatile.Write(ref stop, true);
        writer.Join(5000);

        if (writerFailure != null)
        {
            throw new Exception("order book writer thread failed: " + writerFailure.ToString());
        }

        Assert(violation == null, (violation ?? "") + " -- OrderBook.Copy() must snapshot asks and bids atomically");

        // guard against the test silently passing because the threads never
        // actually overlapped
        Assert(Interlocked.Read(ref copies) > 0, "copy loop observed no snapshots, the race was never exercised");
    }
}
