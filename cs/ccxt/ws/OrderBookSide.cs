namespace ccxt.pro;

// public partial class Exchange : ccxt.Exchange
// {
//     public static int bisectLeft(IList<decimal> arr, decimal x)
//     {
//         int low = 0;
//         int high = arr.Count - 1;
//         while (low <= high)
//         {
//             int mid = (low + high) / 2;
//             if (arr[mid] < x) low = mid + 1;
//             else high = mid - 1;
//         }
//         return low;
//     }

// }

public interface IOrderBookSide : IList<object>
{
    void store(object price, object size);
    void storeArray(object delta);
    void limit();
    void store(object price, object size, object order_id);
    IOrderBookSide Copy();
}


public class OrderBookSide : SlimConcurrentList<object>, IOrderBookSide
{
    // Single owner: every mutator runs on the ws receive loop that owns the book.
    // Nothing here takes a lock. After each mutation PublishSide() freezes this
    // side into an immutable row array and asks the owning book to freeze the
    // asks+bids pair, so a caller on another thread copies one consistent pair.
    internal OrderBook owner;

    // Set by every mutator; the owning book re-freezes this side only when it is set.
    internal bool _dirty = true;

    private bool _side = false;

    protected bool side
    {
        get
        {
            return _side;
        }
        set
        {
            _side = value;
        }
    }

    public static int bisectLeft(IList<decimal> arr, decimal x)
    {
        int low = 0;
        int high = arr.Count - 1;
        while (low <= high)
        {
            int mid = (low + high) / 2;
            if (arr[mid] < x) low = mid + 1;
            else high = mid - 1;
        }
        return low;
    }

    // The IList<decimal> overload above takes the interface path; when the argument
    // is statically known to be a SlimConcurrentList<decimal> (every in-repo call
    // site, since _index is one) this overload runs the same binary search directly
    // on the list. The IList<decimal> signature above stays as public API.
    public static int bisectLeft(SlimConcurrentList<decimal> arr, decimal x)
    {
        return arr.BisectLeft(x);
    }

    // bisect + the `index < _index.Count && _index[index] == x` hit test that every
    // caller runs immediately afterwards, in one pass. `hit` is by construction
    // exactly that expression: Comparer<decimal>.Default.Compare is decimal.Compare,
    // the same value-based comparison as decimal's == and <, so ties are unchanged.
    public static int bisectLeft(SlimConcurrentList<decimal> arr, decimal x, out bool hit)
    {
        return arr.BisectLeft(x, out hit);
    }


    private SlimConcurrentList<decimal> __index = new SlimConcurrentList<decimal>();

    public SlimConcurrentList<decimal> _index
    {
        get
        {
            return __index;
        }
        set
        {
            __index = value;
        }
    }

    // public int Count = 0;

    private int __depth;

    public int _depth
    {
        get
        {
            return __depth;
        }
        set
        {
            __depth = value;
        }
    }

    public OrderBookSide(object deltas2, object depth = null, bool side = false) : base()
    {

        this.side = side;
        this._depth = (depth == null) ? Int32.MaxValue : Convert.ToInt32(depth);
        // var deltas = (List<object>)deltas2;
        // for (var i = 0; i < deltas.Count; i++)
        // {
        //     this.storeArray(deltas[i]); // do we need to copy here??
        // }
        // }
    }

    // Copy() source is already sorted and already has _index. Snapshot
    // constructors still take IList rows and replay storeArray.
    protected void cloneSortedFrom(OrderBookSide source)
    {
        // _index stores -price for bids and +price for asks, so its sign is only
        // meaningful with the side flag. Adopt the source's side FIRST: the base
        // clone ctors default it to false, which would misflag a copied bid side.
        this.side = source.side;
        var rows = new List<object>();
        foreach (var row in source.Published)
        {
            // rebuild each row the way THIS class's storeArray builds one, which
            // is what the replay being replaced did: normal sides hold
            // List<object>, counted sides hold SlimConcurrentList<object>
            rows.Add(cloneRow(row));
        }
        var prices = new List<decimal>();
        foreach (var price in source.PublishedPrices)
        {
            prices.Add(price);
        }
        this.AddRange(rows);
        this._index.AddRange(prices);
    }

    // OrderBookSide/NormalOrderBookSide.storeArray insert plain List<object>
    // rows (the ctor replay hands storeArray a `new List<object>(delta)`), so a
    // structural clone must too, whatever the source row's own type was.
    protected virtual object cloneRow(object row)
    {
        return (row is IList<object> cells) ? new List<object>(cells) : row;
    }

    public void storeArray(object delta2)
    {
        // a mutation enters through the owning book, so a snapshot task replaying rows
        // off the receive loop lands on the owner thread instead of writing the side
        this.RunOwned(() =>
        {
            this._dirty = true;
            this.StoreArrayCore(delta2);
            this.PublishSide();
        });
    }

    // Inline on the owner (the receive loop), one hand-off otherwise, inline when the
    // side has no book yet (construction, copies).
    private void RunOwned(Action work)
    {
        if (this.owner == null)
        {
            work();
            return;
        }
        this.owner.RunOwnedSide(work);
    }

    protected virtual void StoreArrayCore(object delta2)
    {

    var delta = (IList<object>)delta2;
    var price = Convert.ToDecimal(delta[0]);
    var amount = Convert.ToDecimal(delta[1]);
    // hoist `side` / `_index` so the hot loop reads build no repeated property calls
    var sideLocal = this.side;
    var type = (sideLocal) ? "bid" : "ask";
    // if (amount == 0)
    // {
    //     Console.WriteLine($"[{type}]Will deleteeeeee {price} {amount}");

    // }
    // else
    // {
    //     Console.WriteLine($"[{type}] Will store {price} {amount}");

    // }
    // debug
    var index_price = (sideLocal) ? -price : price;
    var indexList = this._index;
    // `hit` is exactly `index < indexList.Count && indexList[index] == index_price`,
    // from the same bisect; the loop is the only writer of _index.
    var index = bisectLeft(indexList, index_price, out var hit);
    if (amount != 0)
    { // check this out does not make sense right now we have to consider null amounts?
        if (hit)
            {
                // replace the level object instead of editing it: a published row
                // array must stay immutable for readers off the receive loop
                var replaced = new List<object>((IList<object>)this[index]);
                replaced[1] = amount;
                this[index] = replaced;
            }
        else
        {
            indexList.Insert(index, index_price);
            this.Insert(index, delta);
        }
    }
    else if (hit)
    {
        indexList.RemoveAt(index);
        this.RemoveAt(index);

    }
    // check if there are duplicated prices in the ob
    // for (var i = 0; i < this._index.Count - 1; i++)
    // {
    //     if (this._index[i] == this._index[i + 1])
    //     {
    //         Console.WriteLine($"Duplicated price on index {this._index[i]}");
    //     }
    //     if (this[i] == this[i + 1])
    //     {
    //         Console.WriteLine($"Duplicated price{this._index[i]}");
    //     }

    //     if (this.side && this._index[i] < this._index[i + 1]) // bids
    //     {
    //         Console.WriteLine($"bids order on index {this._index[i]}");
    //     }
    //     if (this.side && Convert.ToDouble(this[i]) < Convert.ToDouble(this[i + 1]))
    //     {
    //         Console.WriteLine($"bids order on index {this._index[i]}");
    //     }
    //     if (!this.side && this._index[i] > this._index[i + 1])
    //     {
    //         Console.WriteLine($"Wrong order on index {this._index[i]}");
    //     }
    //     if (!this.side && Convert.ToDouble(this[i]) > Convert.ToDouble(this[i + 1]))
    //     {
    //         Console.WriteLine($"Asks Wrong order on index {this._index[i]}");
    //     }

    // }
    }


    public void store(object price, object amount)
    {
        this.storeArray(new SlimConcurrentList<object> { price, amount });
    }

    public void limit()
    {
        this.RunOwned(() =>
        {
            this._dirty = true;
            this.LimitCore();
            this.PublishSide();
        });
    }

    protected virtual void LimitCore()
    {

    var different = this.Count - this._depth;
    var indexList = this._index; // hoisted: the property is a plain field now
    for (var i = 0; i < different; i++)
    {
        var length = this.Count;
        this.RemoveAt(length - 1);
        indexList.RemoveAt(length - 1); // don't use this.Count because it mutates from one line to the other
    }
    }

    // Owner-side trim, called by the book after every mutation so the live side and
    // the published pair stay depth-bounded without a caller ever mutating the book.
    internal void TrimToDepth()
    {
        if (this.Count > this._depth)
        {
            this.LimitCore();
            this.Publish();
        }
    }

    // The owner loop's publication point for this side: an immutable row array for
    // off-loop readers, plus the asks+bids pair captured by the owning book.
    internal void PublishSide()
    {
        if (this.owner != null)
        {
            // the owner refreshes and freezes both sides as one coherent pair
            this.owner.PublishRows();
            return;
        }
        this.Publish();
    }

    internal decimal[] PublishedPrices = Array.Empty<decimal>();

    public override void Publish()
    {
        base.Publish();
        this.PublishedPrices = this._index.LiveArray();
    }


    public void store(object price, object size, object order_id)
    {
        // default implementation, not used on this mode
        this.storeArray(new SlimConcurrentList<object> { price, size });
    }

    // Fill an empty side from an owner-published snapshot pair (rows + price index).
    // Used by OrderBook.Copy so both halves of a book come from one publication.
    internal virtual void LoadFromSnapshot(object[] rows, decimal[] prices)
    {
        if (rows != null && rows.Length > 0)
        {
            this.AddRange(rows);
        }
        if (prices != null && prices.Length > 0)
        {
            this._index.AddRange(prices);
        }
        this._dirty = true;
        this.Publish();
    }

    public IOrderBookSide Copy()
    {
        return this.CopyPublished();
    }

    // Copy from this side's published row array, so it is safe on a caller thread
    // while the receive loop keeps mutating the live list. Single-side callers use
    // Copy(); OrderBook.Copy() builds both halves from its own frozen pair.
    internal IOrderBookSide CopyPublished()
    {
        var copy = new OrderBookSide(this);
        // return copy.ToList() as IOrderBookSide;
        return copy;
    }
}


public class NormalOrderBookSide : OrderBookSide, IOrderBookSide
{
    public NormalOrderBookSide(object deltas2, object depth = null, bool side = false) : base(deltas2, depth, side)
    {

        var deltas = (IList<object>)deltas2;
        var copiedDeltas = new List<object>(deltas);
        for (var i = 0; i < copiedDeltas.Count; i++)
        {
            var delta = copiedDeltas[i] as IList<object>;
            this.storeArray(new List<object>(delta)); // do we need to copy here??
        }
    }

    public NormalOrderBookSide(NormalOrderBookSide source, object depth = null, bool side = false) : base(source, depth, side)
    {
        this.cloneSortedFrom(source);
    }

    public IOrderBookSide Copy()
    {
        return this.CopyPublished();
    }

    // see OrderBookSide.CopyPublished
    internal new IOrderBookSide CopyPublished()
    {
        var copy = new NormalOrderBookSide(this);
        return copy;
    }
}

public class CountedOrderBookSide : OrderBookSide, IOrderBookSide
{

    public CountedOrderBookSide(object deltas2, object depth = null, bool side = false) : base(deltas2, depth, side)
    {

        var deltas = (IList<object>)deltas2;
        for (var i = 0; i < deltas.Count; i++)
        {
            this.storeArray(deltas[i]); // do we need to copy here??
        }
    }

    public CountedOrderBookSide(CountedOrderBookSide source, object depth = null, bool side = false) : base(source, depth, side)
    {
        this.cloneSortedFrom(source);
    }

    // counted rows are inserted by storeArray as SlimConcurrentList<object>
    // (see below), so the structural clone must produce the same CLR type or a
    // copied counted book's rows silently change type versus the replay
    protected override object cloneRow(object row)
    {
        var cells = row as IList<object>;
        if (cells == null)
        {
            return row;
        }
        var clone = new SlimConcurrentList<object>();
        foreach (var cell in cells)
        {
            clone.Add(cell);
        }
        return clone;
    }

    public IOrderBookSide Copy()
    {
        return this.CopyPublished();
    }

    // see OrderBookSide.CopyPublished
    internal new IOrderBookSide CopyPublished()
    {
        var copy = new CountedOrderBookSide(this);
        return copy;
    }

    public void store(object price, object size, object count)
    {
        this.storeArray(new SlimConcurrentList<object> { price, size, count }); // shouldn't be needed but I'm going crazy
    }

    protected override void StoreArrayCore(object deltaArra2)
    {

    var deltaArray = (IList<object>)deltaArra2;
    var price = deltaArray[0];
    var size = Convert.ToDecimal(deltaArray[1]);
    // var count = Convert.ToInt32(deltaArray[2]);
    int count = -1;
    var countObject = deltaArray[2];
    if (!(countObject is IList<object> || countObject is IDictionary<string, object>))
    {
        countObject = Convert.ToInt32(countObject);
        count = Convert.ToInt32(countObject);
    }
    // object storedCount = countObject;
    // int intCount = -1;
    // int.TryParse(storedCount.ToString(), out intCount);
    // if (intCount != -1)
    // {
    //     storedCount = intCount;
    // }
    // int.TryParse(deltaArray[2].ToString(), out count);
    var decimalPrice = Convert.ToDecimal(price);
    // hoist `side` / `_index` so their accessors do not re-enter this side
    var sideLocal = this.side;
    var indexList = this._index;
    var index_price = (sideLocal) ? -decimalPrice : decimalPrice;
    var index = bisectLeft(indexList, index_price, out var hit); // see OrderBookSide.storeArray
    if (size != 0 && countObject != null && count != 0)
    {

        if (hit)
        {

            // replace the level object, see OrderBookSide.StoreArrayCore
                var entry = new List<object>((IList<object>)this[index]);
                entry[1] = size;
                entry[2] = countObject;
                this[index] = entry;
        }
        else
        {
            // this._index.InsertRange(index, new List<decimal>() { index_price });
            indexList.Insert(index, index_price);
            this.Insert(index, new SlimConcurrentList<object>() { price, size, countObject });
        }
    }
    else if (hit)
    {
        indexList.RemoveAt(index);
        this.RemoveAt(index);
    }
    }

}

public class IndexedOrderBookSide : OrderBookSide, IOrderBookSide
{
    // single owner: filled by storeArray on the receive loop, read by load-free copies
    public Dictionary<string, object> hashmap = new Dictionary<string, object>();
    public IndexedOrderBookSide(object deltas2, object depth = null, bool side = false) : base(deltas2, depth, side)
    {


        var deltas = (IList<object>)deltas2;
        for (var i = 0; i < deltas.Count; i++)
        {
            this.storeArray(deltas[i]); // do we need to copy here??
                                        // check if we need this if here or we can 
        }

    }

    public IOrderBookSide Copy()
    {
        return this.CopyPublished();
    }

    // see OrderBookSide.CopyPublished
    internal new IOrderBookSide CopyPublished()
    {
        var copy = new IndexedOrderBookSide(this);
        return copy;
    }

    // Snapshot rebuild for indexed sides: rows carry [price, size, id], so the
    // id -> signed price map is derivable from the published rows.
    internal override void LoadFromSnapshot(object[] rows, decimal[] prices)
    {
        base.LoadFromSnapshot(rows, prices);
        this.hashmap.Clear();
        for (var i = 0; i < this.Count; i++)
        {
            var row = this[i] as IList<object>;
            if (row == null || row.Count < 3 || row[2] == null)
            {
                continue;
            }
            var price = Convert.ToDecimal(row[0]);
            this.hashmap[row[2].ToString()] = (this.side) ? -price : price;
        }
    }

    // ids arrive as freshly boxed references on every parsed ws message, so the
    // former reference-inequality walks (row[2] != order_id) never matched an
    // existing row and ran off the end of the list with an
    // ArgumentOutOfRangeException on every update or delete of a known id; the
    // hashmap already keys by ToString(), the row walks must match it, and the
    // walk must stop at Count so a stale hashmap entry degrades gracefully
    // instead of throwing, see https://github.com/ccxt/ccxt/pull/29745
    private int findRowById(int start, string orderId)
    {
        var index = start;
        while (index < this.Count)
        {
            var row = (IList<object>)this[index];
            if (row.Count > 2 && row[2]?.ToString() == orderId)
            {
                return index;
            }
            index++;
        }
        return -1;
    }

    // the inherited limit() trims rows but left their ids behind in the
    // hashmap, and every later touch of a trimmed id then walked off the list;
    // mirror the python remove_index hook, which existed here but had no
    // caller, see https://github.com/ccxt/ccxt/pull/29745
    protected override void LimitCore()
    {

    var different = this.Count - this._depth;
    var indexList = this._index; // hoisted: the property is a plain field now
    for (var i = 0; i < different; i++)
    {
        var length = this.Count;
        this.remove_index(this[length - 1]);
        this.RemoveAt(length - 1);
        indexList.RemoveAt(length - 1); // don't use this.Count because it mutates from one line to the other
    }
    }


    protected override void StoreArrayCore(object delta2)
    {


    var delta = (IList<object>)delta2;
    var price = Convert.ToDecimal(delta[0]);
    var size = Convert.ToDecimal(delta[1]);
    var order_id = delta[2];
    // hoist `side` / `_index` so their accessors do not re-enter this side
    var sideLocal = this.side;
    var indexList = this._index;
    decimal? index_price = -1;
    if (price != 0)
    {
        var decimalPrice = Convert.ToDecimal(price);
        index_price = (sideLocal) ? -decimalPrice : decimalPrice;
    }
    else
    {
        index_price = null;
    }
    if (size != 0)
    {
        var stringId = order_id.ToString();
        if (this.hashmap.ContainsKey(stringId))
        {
            var old_price = Convert.ToDecimal(this.hashmap[stringId]);
            if (index_price != null)
            {
                index_price = Convert.ToDecimal(index_price);
            }
            else
            {
                index_price = old_price;
            }
            delta[0] = Math.Abs(Convert.ToDecimal(index_price));

            if (index_price == old_price)
            {
                var index2 = this.findRowById(bisectLeft(indexList, Convert.ToDecimal(index_price)), stringId);
                if (index2 >= 0)
                {
                    indexList[index2] = index_price.Value;
                    this[index2] = delta;
                    return;
                }
                // stale hashmap entry, the row is gone (e.g. trimmed by
                // limit before this fix): fall through and insert as new,
                // see https://github.com/ccxt/ccxt/pull/29745
            }
            else
            {
                var old_index = this.findRowById(bisectLeft(indexList, old_price), stringId);
                if (old_index >= 0)
                {
                    indexList.RemoveAt(old_index);
                    this.RemoveAt(old_index);
                }
                // stale entry: nothing to move, fall through and insert as new
            }
        }
        // insert new price Level
        this.hashmap[stringId] = index_price;
        var indexPriceValue = new decimal(-1);
        if (index_price != null)
        {
            indexPriceValue = index_price.Value;
        }
        var index = bisectLeft(indexList, indexPriceValue);
        // var index2Val = ((IList<object>)this[index])[2];
        // index might be a stringified number like '1' or an id like '11AABB'
        // indexList.Count is loop-invariant here (the body only advances
        // `index` and reads rows), so hoist it out of the loop. The
        // `indexList[index] == index_price` test is deliberately NOT fused into
        // the bisect: index_price is a `decimal?` and may be null here, where the
        // lifted == yields false; the fused decimal hit test cannot express that.
        var indexCount = indexList.Count;
        while (index < indexCount && (indexList[index] == index_price) && this.isOrderIsBigger(order_id, index))
        {
            index++;
        }
        indexList.Insert(index, indexPriceValue);
        this.Insert(index, delta);
    }
    else if (this.hashmap.ContainsKey(order_id.ToString()))
    {
        var stringId2 = order_id.ToString();
        var old_price2 = Convert.ToDecimal(this.hashmap[stringId2]);
        var index3 = this.findRowById(bisectLeft(indexList, old_price2), stringId2);
        if (index3 >= 0)
        {
            indexList.RemoveAt(index3);
            this.RemoveAt(index3);
        }
        // a stale entry has no row to remove, just heal the hashmap,
        // see https://github.com/ccxt/ccxt/pull/29745
        this.hashmap.Remove(stringId2);
    }
    }


    private bool isOrderIsBigger(object orderId, int index)
    {
        // index might be a stringified number like '1' or an id like '11AABB'
        var index2Val = ((IList<object>)this[index])[2];
        try
        {
            // Try converting both to decimal
            decimal orderIdDecimal = Convert.ToDecimal(orderId);
            decimal indexDecimal = Convert.ToDecimal(index2Val);
            return orderIdDecimal > indexDecimal;
        }
        catch
        {
            // Fall back to string comparison if decimal conversion fails
            string orderIdStr = orderId?.ToString() ?? "";
            string indexStr = index2Val?.ToString() ?? "";
            return string.Compare(orderIdStr, indexStr, StringComparison.Ordinal) > 0;
        }
    }

    public void remove_index(object order2)
    {

        var order = (IList<object>)order2;
        var order_id = order[2];
        if (this.hashmap.ContainsKey(order_id.ToString()))
        {
            this.hashmap.Remove(order_id.ToString());
        }
    }

    public void store(object price, object size, object order_id)
    {
        this.storeArray(new SlimConcurrentList<object> { price, size, order_id });
    }

    // public void limit() {
    //     if (this.Count > this._depth) {
    //         FirstChanceExceptionEventArgs ()
    //     }
    // }
}


public interface IAsks : IOrderBookSide
{
    public IAsks Copy();

}

public interface IBids : IOrderBookSide
{
    public IBids Copy();

}

public class Asks : NormalOrderBookSide, IAsks
{
    public Asks(object deltas2, object depth = null) : base(deltas2, depth)
    {
        this.side = false;
    }

    public Asks(Asks source) : base(source)
    {
        this.side = false;
    }

    public IAsks Copy()
    {
        return this.CopyPublished();
    }

    // see OrderBookSide.CopyPublished
    internal new IAsks CopyPublished()
    {
        var copy = new Asks(this);
        return copy;
    }
}

public class Bids : NormalOrderBookSide, IBids
{
    public Bids(object deltas2, object depth = null) : base(deltas2, depth, true)
    {
        this.side = true;
    }

    public Bids(Bids source) : base(source, null, true)
    {
        this.side = true;
    }

    public IBids Copy()
    {
        return this.CopyPublished();
    }

    // see OrderBookSide.CopyPublished
    internal new IBids CopyPublished()
    {
        var copy = new Bids(this);
        return copy;
    }
}

public class CountedAsks : CountedOrderBookSide, IAsks
{
    public CountedAsks(object deltas2, object depth = null) : base(deltas2, depth)
    {
        this.side = false;
        // super.side = false;
    }

    public CountedAsks(CountedAsks source) : base(source)
    {
        this.side = false;
    }

    public IAsks Copy()
    {
        return this.CopyPublished();
    }

    // see OrderBookSide.CopyPublished
    internal new IAsks CopyPublished()
    {
        var copy = new CountedAsks(this);
        return copy;
    }
}

public class CountedBids : CountedOrderBookSide, IBids
{
    public CountedBids(object deltas2, object depth = null) : base(deltas2, depth, true)
    {
        this.side = true;
    }

    public CountedBids(CountedBids source) : base(source, null, true)
    {
        this.side = true;
    }

    public IBids Copy()
    {
        return this.CopyPublished();
    }

    // see OrderBookSide.CopyPublished
    internal new IBids CopyPublished()
    {
        var copy = new CountedBids(this);
        return copy;
    }
}


public class IndexedAsks : IndexedOrderBookSide, IAsks
{
    public IndexedAsks(object deltas2, object depth = null) : base(deltas2, depth)
    {
        this.side = false;
    }

    public IAsks Copy()
    {
        return this.CopyPublished();
    }

    // see OrderBookSide.CopyPublished
    internal new IAsks CopyPublished()
    {
        var copy = new IndexedAsks(this);
        return copy;
    }
}

public class IndexedBids : IndexedOrderBookSide, IBids
{
    public IndexedBids(object deltas2, object depth = null) : base(deltas2, depth, true)
    {
        this.side = true;
    }

    public IBids Copy()
    {
        return this.CopyPublished();
    }

    // see OrderBookSide.CopyPublished
    internal new IBids CopyPublished()
    {
        var copy = new IndexedBids(this);
        return copy;
    }
}
