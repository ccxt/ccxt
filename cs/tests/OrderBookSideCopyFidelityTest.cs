namespace Tests;

// native cs test: a structurally-cloned side must be a faithful copy, not just
// a same-looking one.
//
// #30050 replaced the storeArray replay in the side copy constructors with a
// structural clone of the two parallel lists (rows + _index). _index holds
// -price for bids and +price for asks, so the copied index is only meaningful
// together with the side flag, and the clone ctors of the intermediate base
// classes (NormalOrderBookSide/CountedOrderBookSide, which
// NormalOrderBookSide.CopyUnlocked and CountedOrderBookSide.CopyUnlocked
// construct through) default that flag to false.
//
// Copying a bid side through one of those therefore used to produce an object
// carrying a NEGATIVE index while flagged as an ask. Such a side is not merely
// re-sorted, it is internally inconsistent: the next storeArray computes a
// POSITIVE index_price, bisects it against all-negative keys, gets Count back,
// and appends the level at the wrong end of the book. Nothing throws, the
// lengths still agree, and the book silently stops being sorted -- exactly the
// class of corruption that only shows up downstream as a crossed book.
//
// So the assertions below deliberately do NOT stop at "same rows in the same
// order". They check the copy is still a working bid book by pushing a delta
// through it and requiring it to land in the correct slot.

public partial class BaseTest
{
    private static List<object> cloneFidelityBids()
    {
        // deliberately unsorted input so the copy cannot accidentally look right
        return new List<object>() {
            new List<object>() { 100.5m, 1.5m },
            new List<object>() { 101.0m, 2.0m },
            new List<object>() { 99.25m, 3.0m },
            new List<object>() { 102.75m, 4.5m },
        };
    }

    private static decimal cloneFidelityPrice(ccxt.pro.IOrderBookSide side, int index)
    {
        return Convert.ToDecimal(((IList<object>)side[index])[0]);
    }

    private static void assertDescending(ccxt.pro.IOrderBookSide side, string label)
    {
        for (var i = 0; i + 1 < side.Count; i++)
        {
            var here = cloneFidelityPrice(side, i);
            var next = cloneFidelityPrice(side, i + 1);
            Assert(here > next, label + ": bids must stay in descending price order, got " + here + " before " + next);
        }
    }

    public void testWsOrderBookSideCopyFidelity()
    {
        // --- Bids copied through the concrete class -------------------------
        var bids = new ccxt.pro.Bids(cloneFidelityBids());
        var bidsCopy = bids.Copy();
        Assert(bidsCopy.Count == bids.Count, "Bids.Copy() must preserve depth");
        assertDescending(bidsCopy, "Bids.Copy()");

        // --- Bids copied through the base-class handle ----------------------
        // this is the path OrderBook.Copy() drives via CopyUnlocked, and the one
        // that used to hand back a bid book flagged as an ask
        var viaBase = ((ccxt.pro.IOrderBookSide)new ccxt.pro.Bids(cloneFidelityBids())).Copy();
        Assert(viaBase.Count == 4, "base-handle Bids copy must preserve depth");
        assertDescending(viaBase, "base-handle Bids copy");

        // the real test: the copy must still behave like a bid book. 100 sits
        // between 100.5 and 99.25, so it belongs at index 3 of 5. A copy whose
        // side flag disagrees with its index sign appends it last instead.
        viaBase.storeArray(new List<object>() { 100.0m, 5.0m });
        Assert(viaBase.Count == 5, "storeArray on a copied bid side must insert the new level");
        assertDescending(viaBase, "base-handle Bids copy after storeArray");
        Assert(cloneFidelityPrice(viaBase, 3) == 100.0m,
            "a delta at 100 must land between 100.5 and 99.25, not at the end -- copied bid side lost its side flag");

        // --- same for counted sides ----------------------------------------
        var countedRows = new List<object>() {
            new List<object>() { 100.5m, 1.5m, 3 },
            new List<object>() { 101.0m, 2.0m, 5 },
            new List<object>() { 99.25m, 3.0m, 1 },
            new List<object>() { 102.75m, 4.5m, 9 },
        };
        var countedViaBase = ((ccxt.pro.IOrderBookSide)new ccxt.pro.CountedBids(countedRows)).Copy();
        assertDescending(countedViaBase, "base-handle CountedBids copy");
        countedViaBase.storeArray(new List<object>() { 100.0m, 5.0m, 2 });
        assertDescending(countedViaBase, "base-handle CountedBids copy after storeArray");
        Assert(cloneFidelityPrice(countedViaBase, 3) == 100.0m,
            "a counted delta at 100 must land between 100.5 and 99.25 on a copied bid side");

        // --- counted rows must keep their CLR type --------------------------
        // CountedOrderBookSide.storeArray inserts SlimConcurrentList<object>
        // rows; the structural clone must produce the same type or a copied
        // counted book's rows silently change type for every consumer
        var counted = new ccxt.pro.CountedAsks(countedRows);
        var countedCopy = counted.Copy();
        for (var i = 0; i < countedCopy.Count; i++)
        {
            Assert(countedCopy[i] is ccxt.pro.SlimConcurrentList<object>,
                "counted rows must stay SlimConcurrentList<object> through Copy(), row " + i + " is " + countedCopy[i].GetType().Name);
        }

        // --- deep copy: mutating the copy must not touch the source ---------
        var src = new ccxt.pro.Bids(cloneFidelityBids());
        var deep = src.Copy();
        ((IList<object>)deep[0])[1] = 999m;
        Assert(Convert.ToDecimal(((IList<object>)src[0])[1]) != 999m, "Copy() must deep-copy rows, not share them");

        // --- whole-book copy keeps both sides correctly ordered -------------
        var book = new ccxt.pro.OrderBook(new Dictionary<string, object>() {
            { "asks", new List<object>() {
                new List<object>() { 103.0m, 1.0m },
                new List<object>() { 104.5m, 2.0m },
                new List<object>() { 103.5m, 3.0m } } },
            { "bids", cloneFidelityBids() },
        });
        var bookCopy = book.Copy();
        assertDescending(bookCopy.bids, "OrderBook.Copy().bids");
        for (var i = 0; i + 1 < bookCopy.asks.Count; i++)
        {
            Assert(cloneFidelityPrice(bookCopy.asks, i) < cloneFidelityPrice(bookCopy.asks, i + 1),
                "OrderBook.Copy().asks must stay in ascending price order");
        }
        Assert(cloneFidelityPrice(bookCopy.bids, 0) < cloneFidelityPrice(bookCopy.asks, 0),
            "OrderBook.Copy() must not return a crossed book");
    }
}
